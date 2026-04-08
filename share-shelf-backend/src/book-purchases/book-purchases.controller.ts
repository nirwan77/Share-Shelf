import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BookPurchasesService } from './book-purchases.service';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from 'src/shared';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('book-purchases')
@Controller('book-purchases')
@UseGuards(JwtHeaderAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BookPurchasesController {
  constructor(private readonly bookPurchasesService: BookPurchasesService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a new book purchase' })
  async initiatePurchase(
    @GetDashboardUserReqObject('id') userId: string,
    @Body() body: { offerId: string; location?: string },
  ) {
    return this.bookPurchasesService.initiatePurchase(userId, body.offerId, body.location);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a book purchase after payment' })
  async completePurchase(
    @Param('id') id: string,
    @GetDashboardUserReqObject('id') userId: string,
    @Body() payload: any,
  ) {
    return this.bookPurchasesService.completePurchase(id, userId, payload);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user purchases' })
  async getMyPurchases(@GetDashboardUserReqObject('id') userId: string) {
    return this.bookPurchasesService.getMyPurchases(userId);
  }
}
