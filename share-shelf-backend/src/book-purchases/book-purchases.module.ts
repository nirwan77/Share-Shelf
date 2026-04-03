import { Module } from '@nestjs/common';
import { BookPurchasesService } from './book-purchases.service';
import { BookPurchasesController } from './book-purchases.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [BookPurchasesController],
  providers: [BookPurchasesService, PrismaService],
  imports: [NotificationsModule, AuthModule],
  exports: [BookPurchasesService],
})
export class BookPurchasesModule {}
