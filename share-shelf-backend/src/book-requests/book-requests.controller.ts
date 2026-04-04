import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookRequestsService } from './book-requests.service';
import { JwtHeaderAuthGuard } from '../shared/authGuard';
import { GetDashboardUserReqObject } from '../shared/authDecorator';

@ApiTags('book-requests')
@ApiBearerAuth('JWT-auth')
@Controller('book-requests')
@UseGuards(JwtHeaderAuthGuard)
export class BookRequestsController {
  constructor(private readonly bookRequestsService: BookRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a book request' })
  create(
    @GetDashboardUserReqObject('id') userId: string,
    @Body()
    body: {
      title: string;
      author: string;
      description?: string;
      image?: string;
    },
  ) {
    return this.bookRequestsService.create(userId, body);
  }

  @Get('my')
  @ApiOperation({ summary: "List current user's book requests" })
  findMyRequests(@GetDashboardUserReqObject('id') userId: string) {
    return this.bookRequestsService.findMyRequests(userId);
  }
}
