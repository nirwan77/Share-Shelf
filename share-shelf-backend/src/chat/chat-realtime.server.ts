import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { createHash } from 'crypto';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';

type ChatClient = {
  socket: Socket;
  userId: string;
  buffer: Buffer;
  conversations: Set<string>;
};

@Injectable()
export class ChatRealtimeServer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatRealtimeServer.name);
  private readonly clients = new Map<Socket, ChatClient>();
  private readonly clientsByUser = new Map<string, Set<ChatClient>>();
  private readonly upgradeHandler = (
    request: IncomingMessage,
    socket: Socket,
  ) => {
    void this.handleUpgrade(request, socket);
  };

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  onModuleInit() {
    const server = this.adapterHost.httpAdapter?.getHttpServer();
    server?.on('upgrade', this.upgradeHandler);
  }

  onModuleDestroy() {
    const server = this.adapterHost.httpAdapter?.getHttpServer();
    server?.off('upgrade', this.upgradeHandler);

    for (const client of this.clients.values()) {
      this.closeClient(client);
    }
  }

  private async handleUpgrade(request: IncomingMessage, socket: Socket) {
    const host = request.headers.host ?? 'localhost';
    const url = new URL(request.url ?? '', `http://${host}`);

    if (url.pathname !== '/chat/socket') {
      socket.destroy();
      return;
    }

    const key = request.headers['sec-websocket-key'];
    const token = url.searchParams.get('token');

    if (!key || Array.isArray(key) || !token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    try {
      const payload = this.authService.verifyToken(token);
      const accept = createHash('sha1')
        .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
        .digest('base64');

      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
          'Upgrade: websocket\r\n' +
          'Connection: Upgrade\r\n' +
          `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
      );

      const client: ChatClient = {
        socket,
        userId: payload.sub,
        buffer: Buffer.alloc(0),
        conversations: new Set(),
      };

      this.clients.set(socket, client);
      this.addClientToUser(client);
      this.sendJson(client, { type: 'connected' });

      socket.on('data', (chunk) => void this.handleData(client, chunk));
      socket.on('close', () => this.removeClient(client));
      socket.on('error', () => this.removeClient(client));
    } catch (error) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  }

  private async handleData(client: ChatClient, chunk: Buffer) {
    client.buffer = Buffer.concat([client.buffer, chunk]);

    while (client.buffer.length >= 2) {
      const frame = this.readFrame(client.buffer);

      if (!frame) {
        return;
      }

      client.buffer = client.buffer.subarray(frame.bytesRead);

      if (frame.opcode === 0x8) {
        this.closeClient(client);
        return;
      }

      if (frame.opcode === 0x9) {
        this.sendFrame(client.socket, frame.payload, 0xA);
        continue;
      }

      if (frame.opcode !== 0x1) {
        continue;
      }

      try {
        await this.handleMessage(client, frame.payload.toString('utf8'));
      } catch (error) {
        this.sendJson(client, {
          type: 'error',
          message: error instanceof Error ? error.message : 'Chat error',
        });
      }
    }
  }

  private async handleMessage(client: ChatClient, rawMessage: string) {
    const payload = JSON.parse(rawMessage);

    if (payload.type === 'ping') {
      this.sendJson(client, { type: 'pong' });
      return;
    }

    if (payload.type === 'join_conversation') {
      await this.chatService.assertParticipant(client.userId, payload.conversationId);
      client.conversations.add(payload.conversationId);
      this.sendJson(client, {
        type: 'conversation_joined',
        conversationId: payload.conversationId,
      });
      return;
    }

    if (payload.type === 'send_message') {
      const message = await this.chatService.createMessage(
        client.userId,
        payload.conversationId,
        payload.text,
      );
      const participantIds = await this.chatService.getParticipantIds(
        payload.conversationId,
      );

      for (const participantId of participantIds) {
        this.broadcastToUser(participantId, {
          type: 'message_created',
          message,
        });
      }
    }
  }

  private readFrame(buffer: Buffer) {
    const firstByte = buffer[0];
    const secondByte = buffer[1];
    const opcode = firstByte & 0x0f;
    const isMasked = (secondByte & 0x80) === 0x80;
    let payloadLength = secondByte & 0x7f;
    let offset = 2;

    if (payloadLength === 126) {
      if (buffer.length < offset + 2) return null;
      payloadLength = buffer.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      if (buffer.length < offset + 8) return null;
      const high = buffer.readUInt32BE(offset);
      const low = buffer.readUInt32BE(offset + 4);
      if (high !== 0) {
        throw new Error('Message is too large');
      }
      payloadLength = low;
      offset += 8;
    }

    const maskLength = isMasked ? 4 : 0;
    const frameLength = offset + maskLength + payloadLength;

    if (buffer.length < frameLength) {
      return null;
    }

    let payload = buffer.subarray(offset + maskLength, frameLength);

    if (isMasked) {
      const mask = buffer.subarray(offset, offset + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    }

    return {
      opcode,
      payload,
      bytesRead: frameLength,
    };
  }

  private addClientToUser(client: ChatClient) {
    const clients = this.clientsByUser.get(client.userId) ?? new Set<ChatClient>();
    clients.add(client);
    this.clientsByUser.set(client.userId, clients);
  }

  private removeClient(client: ChatClient) {
    this.clients.delete(client.socket);

    const userClients = this.clientsByUser.get(client.userId);
    userClients?.delete(client);

    if (userClients?.size === 0) {
      this.clientsByUser.delete(client.userId);
    }
  }

  private broadcastToUser(userId: string, payload: unknown) {
    const clients = this.clientsByUser.get(userId);
    if (!clients) return;

    for (const client of clients) {
      this.sendJson(client, payload);
    }
  }

  private sendJson(client: ChatClient, payload: unknown) {
    this.sendFrame(client.socket, Buffer.from(JSON.stringify(payload)), 0x1);
  }

  private sendFrame(socket: Socket, payload: Buffer, opcode: number) {
    const length = payload.length;
    let header: Buffer;

    if (length < 126) {
      header = Buffer.from([0x80 | opcode, length]);
    } else if (length < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | opcode;
      header[1] = 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | opcode;
      header[1] = 127;
      header.writeUInt32BE(0, 2);
      header.writeUInt32BE(length, 6);
    }

    socket.write(Buffer.concat([header, payload]));
  }

  private closeClient(client: ChatClient) {
    try {
      this.sendFrame(client.socket, Buffer.alloc(0), 0x8);
      client.socket.end();
    } catch (error) {
      this.logger.debug('Unable to close websocket client cleanly');
    } finally {
      this.removeClient(client);
    }
  }
}
