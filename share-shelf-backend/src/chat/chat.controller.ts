import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from '../shared';
import { ChatService } from './chat.service';

@ApiTags('chat')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtHeaderAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: "List current user's conversations" })
  findConversations(@GetDashboardUserReqObject('id') userId: string) {
    return this.chatService.findConversations(userId);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Start or return a one-to-one conversation' })
  createConversation(
    @GetDashboardUserReqObject('id') userId: string,
    @Body('participantId') participantId: string,
  ) {
    return this.chatService.createConversation(userId, participantId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'List messages in a conversation' })
  findMessages(
    @GetDashboardUserReqObject('id') userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.chatService.findMessages(userId, conversationId);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  createMessage(
    @GetDashboardUserReqObject('id') userId: string,
    @Param('id') conversationId: string,
    @Body('text') text: string,
  ) {
    return this.chatService.createMessage(userId, conversationId, text);
  }
}
