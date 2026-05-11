import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetDashboardUserReqObject, JwtHeaderAuthGuard } from 'src/shared';
import { ReadingGoalsService } from './reading-goals.service';

@ApiTags('reading-goals')
@Controller('reading-goals')
@UseGuards(JwtHeaderAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReadingGoalsController {
  constructor(private readonly readingGoalsService: ReadingGoalsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current reading challenge and achievements' })
  getSummary(@GetDashboardUserReqObject('id') userId: string) {
    return this.readingGoalsService.getSummary(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Set current user reading challenge' })
  setGoal(
    @GetDashboardUserReqObject('id') userId: string,
    @Body() body: { targetBooks: number; year?: number },
  ) {
    return this.readingGoalsService.setGoal(
      userId,
      body.targetBooks,
      body.year,
    );
  }
}
