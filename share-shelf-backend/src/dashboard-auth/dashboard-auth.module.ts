import { Module } from '@nestjs/common';
import { DashboardAuthService } from './dashboard-auth.service';
import { DashboardAuthController } from './dashboard-auth.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
  ],
  controllers: [DashboardAuthController],
  providers: [DashboardAuthService],
  exports: [DashboardAuthService],
})
export class DashboardAuthModule {}
