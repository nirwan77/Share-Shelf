import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from '../shared';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findOne(@GetDashboardUserReqObject('id') userId: string) {
    return this.profileService.findOne(userId);
  }
}
