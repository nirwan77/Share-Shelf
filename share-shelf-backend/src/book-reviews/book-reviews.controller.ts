import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { BookReviewsService } from './book-reviews.service';
import { CreateBookReviewDto } from './dto/create-book-review.dto';
import { JwtHeaderAuthGuard, GetDashboardUserReqObject } from '../shared';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('book-reviews')
@Controller('book-reviews')
export class BookReviewsController {
  constructor(private readonly bookReviewsService: BookReviewsService) {}

  @Post()
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  create(
    @GetDashboardUserReqObject('id') userId: string,
    @Body() createBookReviewDto: CreateBookReviewDto,
  ) {
    return this.bookReviewsService.create(userId, createBookReviewDto);
  }

  @Get('book/:bookId')
  findAllByBook(
    @Param('bookId') bookId: string,
    @Query('userId') userId?: string,
  ) {
    return this.bookReviewsService.findAllByBook(bookId, userId);
  }

  @Patch(':reviewId/vote')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  vote(
    @GetDashboardUserReqObject('id') userId: string,
    @Param('reviewId') reviewId: string,
    @Body('voteType') voteType: 'UPVOTE' | 'DOWNVOTE',
  ) {
    return this.bookReviewsService.voteReview(userId, reviewId, voteType);
  }
}
