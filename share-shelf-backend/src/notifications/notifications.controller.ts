import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from 'src/shared';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtHeaderAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@GetDashboardUserReqObject('id') userId: string) {
    return this.notificationsService.findAll(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@GetDashboardUserReqObject('id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }
}
