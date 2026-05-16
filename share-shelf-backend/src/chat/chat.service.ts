import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const userSelect = {
  id: true,
  name: true,
  avatar: true,
};

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findConversations(userId: string) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        OR: [{ userOneId: userId }, { userTwoId: userId }],
      },
      include: {
        userOne: { select: userSelect },
        userTwo: { select: userSelect },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: userSelect },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((conversation) =>
      this.serializeConversation(conversation, userId),
    );
  }

  async createConversation(userId: string, participantId: string) {
    if (!participantId) {
      throw new BadRequestException('participantId is required');
    }

    if (userId === participantId) {
      throw new BadRequestException('You cannot start a chat with yourself');
    }

    const participant = await this.prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true },
    });

    if (!participant) {
      throw new NotFoundException('User not found');
    }

    const [userOneId, userTwoId] = this.normalizeParticipants(
      userId,
      participantId,
    );

    const conversation = await this.prisma.chatConversation.upsert({
      where: {
        userOneId_userTwoId: {
          userOneId,
          userTwoId,
        },
      },
      create: {
        userOneId,
        userTwoId,
      },
      update: {},
      include: {
        userOne: { select: userSelect },
        userTwo: { select: userSelect },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: userSelect },
          },
        },
      },
    });

    return this.serializeConversation(conversation, userId);
  }

  async findMessages(userId: string, conversationId: string) {
    await this.assertParticipant(userId, conversationId);

    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      include: {
        sender: { select: userSelect },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((message) => this.serializeMessage(message));
  }

  async createMessage(userId: string, conversationId: string, text: string) {
    const trimmedText = text?.trim();

    if (!trimmedText) {
      throw new BadRequestException('Message cannot be empty');
    }

    if (trimmedText.length > 2000) {
      throw new BadRequestException('Message cannot exceed 2000 characters');
    }

    await this.assertParticipant(userId, conversationId);

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.chatMessage.create({
        data: {
          conversationId,
          senderId: userId,
          text: trimmedText,
        },
        include: {
          sender: { select: userSelect },
        },
      });

      await tx.chatConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return created;
    });

    return this.serializeMessage(message);
  }

  async assertParticipant(userId: string, conversationId: string) {
    const conversation = await this.prisma.chatConversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        userOneId: true,
        userTwoId: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return conversation;
  }

  async getParticipantIds(conversationId: string) {
    const conversation = await this.prisma.chatConversation.findUnique({
      where: { id: conversationId },
      select: {
        userOneId: true,
        userTwoId: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return [conversation.userOneId, conversation.userTwoId];
  }

  private normalizeParticipants(userId: string, participantId: string) {
    return [userId, participantId].sort() as [string, string];
  }

  private serializeConversation(conversation: any, currentUserId: string) {
    const otherUser =
      conversation.userOneId === currentUserId
        ? conversation.userTwo
        : conversation.userOne;
    const lastMessage = conversation.messages?.[0] ?? null;

    return {
      id: conversation.id,
      participant: otherUser,
      lastMessage: lastMessage ? this.serializeMessage(lastMessage) : null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  private serializeMessage(message: any) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: message.sender,
      text: message.text,
      createdAt: message.createdAt,
    };
  }
}
