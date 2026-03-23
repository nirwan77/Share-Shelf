import { Module } from '@nestjs/common';
import { DashboardUserStatsService } from './dashboard-user-stats.service';
import { DashboardUserStatsController } from './dashboard-user-stats.controller';
import { PrismaModule } from '../prisma.module';
import { DashboardAuthModule } from '../dashboard-auth/dashboard-auth.module';

@Module({
  imports: [PrismaModule, DashboardAuthModule],
  controllers: [DashboardUserStatsController],
  providers: [DashboardUserStatsService],
})
export class DashboardUserStatsModule {}
