import { Module } from '@nestjs/common';
import { DashboardStatsService } from './dashboard-stats.service';
import { PrismaModule } from '../prisma.module';
import { DashboardStatsController } from './dashboard-stats.controller';
import { DashboardAuthModule } from '../dashboard-auth/dashboard-auth.module';

@Module({
  imports: [PrismaModule, DashboardAuthModule],
  controllers: [DashboardStatsController],
  providers: [DashboardStatsService],
})
export class DashboardStatsModule { }
