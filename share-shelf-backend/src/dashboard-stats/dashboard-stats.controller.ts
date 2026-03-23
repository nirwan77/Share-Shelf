import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardStatsService } from './dashboard-stats.service';
import { DashboardAuthGuard } from '../shared/dashboardGuard';

@ApiTags('dashboard-stats')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard-stats')
@UseGuards(DashboardAuthGuard)
export class DashboardStatsController {
  constructor(private readonly dashboardStatsService: DashboardStatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get overview statistics for the dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getStats() {
    return await this.dashboardStatsService.getDashboardStats();
  }
}
