import { Controller, Get, Patch, Body, UseGuards, Param, Post, Delete, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from '../shared';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

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

  @Get(':id')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findOnePublic(
    @Param('id') id: string,
    @GetDashboardUserReqObject('id') userId: string,
  ) {
    return this.profileService.findOnePublic(id, userId);
  }

  @Post('follow/:id')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  follow(
    @GetDashboardUserReqObject('id') followerId: string,
    @Param('id') followingId: string,
  ) {
    return this.profileService.follow(followerId, followingId);
  }

  @Delete('follow/:id')
  @UseGuards(JwtHeaderAuthGuard)
  @ApiBearerAuth('JWT-auth')
  unfollow(
    @GetDashboardUserReqObject('id') followerId: string,
    @Param('id') followingId: string,
  ) {
    return this.profileService.unfollow(followerId, followingId);
  }

  @Get(':id/followers')
  getFollowers(@Param('id') userId: string) {
    return this.profileService.getFollowers(userId);
  }

  @Get(':id/following')
  getFollowing(@Param('id') userId: string) {
    return this.profileService.getFollowing(userId);
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

  @Get('search/users')
  @ApiOperation({ summary: 'Search for users by name' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  searchUsers(@Query('q') query: string) {
    return this.profileService.searchUsers(query);
  }
}
