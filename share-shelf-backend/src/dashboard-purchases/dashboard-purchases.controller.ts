import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DashboardPurchasesService } from './dashboard-purchases.service';
import { DashboardAuthGuard } from 'src/shared/dashboardGuard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('dashboard-purchases')
@Controller('dashboard-purchases')
@UseGuards(DashboardAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardPurchasesController {
  constructor(private readonly dashboardPurchasesService: DashboardPurchasesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pending transactions' })
  async getPendingTransactions() {
    return this.dashboardPurchasesService.getPendingTransactions();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all book purchase transactions' })
  async getAllTransactions() {
    return this.dashboardPurchasesService.getAllTransactions();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get purchase commission and payout summary' })
  async getSummary() {
    return this.dashboardPurchasesService.getSummary();
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer money to seller' })
  async completeTransfer(@Param('id') id: string) {
    return this.dashboardPurchasesService.completeTransfer(id);
  }

  @Post(':id/notify-seller')
  @ApiOperation({ summary: 'Notify seller to prepare and coordinate delivery' })
  async notifySeller(@Param('id') id: string) {
    return this.dashboardPurchasesService.notifySeller(id);
  }
}
