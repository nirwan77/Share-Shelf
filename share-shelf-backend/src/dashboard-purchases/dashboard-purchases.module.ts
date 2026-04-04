import { Module } from '@nestjs/common';
import { DashboardPurchasesService } from './dashboard-purchases.service';
import { DashboardPurchasesController } from './dashboard-purchases.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PrismaService } from 'src/prisma.service';
import { DashboardAuthModule } from 'src/dashboard-auth/dashboard-auth.module';

@Module({
  controllers: [DashboardPurchasesController],
  providers: [DashboardPurchasesService, PrismaService],
  imports: [NotificationsModule, DashboardAuthModule],
})
export class DashboardPurchasesModule {}
