import { Module } from '@nestjs/common';
import { DashboardBookRequestsService } from './dashboard-book-requests.service';
import { DashboardBookRequestsController } from './dashboard-book-requests.controller';
import { PrismaModule } from '../prisma.module';
import { DashboardAuthModule } from '../dashboard-auth/dashboard-auth.module';

@Module({
  imports: [PrismaModule, DashboardAuthModule],
  controllers: [DashboardBookRequestsController],
  providers: [DashboardBookRequestsService],
})
export class DashboardBookRequestsModule {}
