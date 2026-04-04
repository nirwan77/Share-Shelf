import { Module } from '@nestjs/common';
import { BookOffersService } from './book-offers.service';
import { BookOffersController } from './book-offers.controller';
import { PrismaModule } from 'src/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookOffersController],
  providers: [BookOffersService],
})
export class BookOffersModule {}
