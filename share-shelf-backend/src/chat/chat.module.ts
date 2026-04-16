import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma.module';
import { ChatController } from './chat.controller';
import { ChatRealtimeServer } from './chat-realtime.server';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRealtimeServer],
  exports: [ChatService],
})
export class ChatModule {}
