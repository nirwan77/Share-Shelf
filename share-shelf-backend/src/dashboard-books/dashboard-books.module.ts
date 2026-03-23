import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DashboardBooksController } from './dashboard-books.controller';
import { DashboardBooksService } from './dashboard-books.service';
import { DashboardAuthModule } from 'src/dashboard-auth/dashboard-auth.module';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule, DashboardAuthModule],
  controllers: [DashboardBooksController],
  providers: [DashboardBooksService, PrismaService],
})
export class DashboardBooksModule { }
