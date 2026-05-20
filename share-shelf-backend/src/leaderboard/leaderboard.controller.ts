import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetDashboardUserReqObject,
  JwtOptionalAuthGuard,
} from 'src/shared';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get ranked users by community activity' })
  async getLeaderboard(
    @Query() query: LeaderboardQueryDto,
    @GetDashboardUserReqObject('id') userId?: string,
  ) {
    return this.leaderboardService.getLeaderboard(query, userId);
  }
}
