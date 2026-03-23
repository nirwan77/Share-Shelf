import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardUserStatsService } from './dashboard-user-stats.service';
import { DashboardAuthGuard } from '../shared/dashboardGuard';

@ApiTags('dashboard-user-stats')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard-user-stats')
@UseGuards(DashboardAuthGuard)
export class DashboardUserStatsController {
  constructor(private readonly dashboardUserStatsService: DashboardUserStatsService) {}

  @Get()
  @ApiOperation({ summary: 'List all users with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.dashboardUserStatsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed statistics for a specific user' })
  async findOne(@Param('id') id: string) {
    return this.dashboardUserStatsService.findOne(id);
  }
}
