import { Controller, Post, Body, UseGuards, Delete, Param } from '@nestjs/common';
import { BookStatusService } from './book-status.service';
import { JwtHeaderAuthGuard, GetDashboardUserReqObject } from '../shared';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BookStatus } from '@prisma/client';

@Controller('book-status')
export class BookStatusController {
  constructor(private readonly bookStatusService: BookStatusService) {}

  @Post()
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  toggleStatus(
    @GetDashboardUserReqObject('id') userId: string,
    @Body() data: { bookId: string; status: BookStatus },
  ) {
    return this.bookStatusService.toggleStatus(userId, data);
  }
}
