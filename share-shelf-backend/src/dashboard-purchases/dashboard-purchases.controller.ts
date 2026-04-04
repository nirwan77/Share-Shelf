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

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer money to seller' })
  async completeTransfer(@Param('id') id: string) {
    return this.dashboardPurchasesService.completeTransfer(id);
  }
}
