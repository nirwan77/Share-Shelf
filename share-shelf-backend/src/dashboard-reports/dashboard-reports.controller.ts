import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardAuthGuard } from '../shared/dashboardGuard';
import { GetDashboardUserReqObject } from '../shared/authDecorator';
import { DashboardReportsService } from './dashboard-reports.service';

@ApiTags('dashboard-reports')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard-reports')
@UseGuards(DashboardAuthGuard)
export class DashboardReportsController {
  constructor(private readonly dashboardReportsService: DashboardReportsService) {}

  @Get()
  @ApiOperation({ summary: 'List reports for moderation' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardReportsService.findAll(
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('deleted-comments')
  @ApiOperation({ summary: 'List comments removed by moderation' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findDeletedComments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardReportsService.findDeletedComments(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Mark a report as resolved' })
  resolveReport(@Param('id') id: string) {
    return this.dashboardReportsService.resolveReport(id);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss a report' })
  dismissReport(@Param('id') id: string) {
    return this.dashboardReportsService.dismissReport(id);
  }

  @Delete('post/:postId')
  @ApiOperation({ summary: 'Remove a reported post' })
  deletePost(@Param('postId') postId: string) {
    return this.dashboardReportsService.deletePost(postId);
  }

  @Delete('comment/:commentId')
  @ApiOperation({ summary: 'Remove a reported comment' })
  deleteComment(
    @Param('commentId') commentId: string,
    @GetDashboardUserReqObject('id') dashboardUserId?: string,
  ) {
    return this.dashboardReportsService.deleteComment(commentId, dashboardUserId);
  }

  @Patch('user/:userId/ban')
  @ApiOperation({ summary: 'Ban a reported user' })
  banUser(@Param('userId') userId: string) {
    return this.dashboardReportsService.banUser(userId);
  }
}
