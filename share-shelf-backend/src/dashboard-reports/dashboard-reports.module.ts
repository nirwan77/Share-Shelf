import { Module } from '@nestjs/common';
import { DashboardAuthModule } from '../dashboard-auth/dashboard-auth.module';
import { PrismaModule } from '../prisma.module';
import { DashboardReportsController } from './dashboard-reports.controller';
import { DashboardReportsService } from './dashboard-reports.service';

@Module({
  imports: [PrismaModule, DashboardAuthModule],
  controllers: [DashboardReportsController],
  providers: [DashboardReportsService],
})
export class DashboardReportsModule {}
