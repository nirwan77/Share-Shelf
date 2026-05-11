import { Module } from '@nestjs/common';
import { BookOffersService } from './book-offers.service';
import { BookOffersController } from './book-offers.controller';
import { PrismaModule } from 'src/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  controllers: [BookOffersController],
  providers: [BookOffersService],
})
export class BookOffersModule {}
