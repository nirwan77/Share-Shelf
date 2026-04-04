import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BookOffersService } from './book-offers.service';
import { JwtHeaderAuthGuard } from '../shared/authGuard';
import { GetDashboardUserReqObject } from '../shared/authDecorator';
import { OfferType } from '@prisma/client';

@ApiTags('book-offers')
@Controller('book-offers')
export class BookOffersController {
  constructor(private readonly bookOffersService: BookOffersService) {}

  @Post()
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a book offer' })
  create(
    @GetDashboardUserReqObject('id') userId: string,
    @Body()
    body: {
      bookId: string;
      price: number;
      condition?: string;
      type: OfferType;
      note?: string;
    },
  ) {
    return this.bookOffersService.create(userId, body);
  }

  @Get('my')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "List current user's offers" })
  findMyOffers(@GetDashboardUserReqObject('id') userId: string) {
    return this.bookOffersService.findMyOffers(userId);
  }

  @Get()
  @ApiOperation({ summary: 'List active offers for a book' })
  @ApiQuery({ name: 'bookId', required: true, type: String })
  findByBook(@Query('bookId') bookId: string) {
    return this.bookOffersService.findByBook(bookId);
  }

  @Delete(':id')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete own offer' })
  remove(
    @Param('id') id: string,
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.bookOffersService.remove(id, userId);
  }
}
