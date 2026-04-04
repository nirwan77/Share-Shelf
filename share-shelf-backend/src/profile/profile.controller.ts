import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from '../shared';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findOne(@GetDashboardUserReqObject('id') userId: string) {
    return this.profileService.findOne(userId);
  }

  @Patch('avatar')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile picture' })
  updateAvatar(
    @GetDashboardUserReqObject('id') userId: string,
    @Body('avatarUrl') avatarUrl: string,
  ) {
    return this.profileService.updateAvatar(userId, avatarUrl);
  }
}
