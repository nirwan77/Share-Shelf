import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { DashboardBookRequestsService } from './dashboard-book-requests.service';
import { DashboardAuthGuard } from '../shared/dashboardGuard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BookRequestStatus } from '@prisma/client';

@Controller('dashboard-book-requests')
@UseGuards(DashboardAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardBookRequestsController {
  constructor(private readonly service: DashboardBookRequestsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: BookRequestStatus,
  ) {
    return this.service.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.updateStatus(id, 'APPROVED');
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.updateStatus(id, 'REJECTED');
  }
}
