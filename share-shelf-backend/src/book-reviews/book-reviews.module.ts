import { Module } from '@nestjs/common';
import { BookReviewsService } from './book-reviews.service';
import { BookReviewsController } from './book-reviews.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookReviewsController],
  providers: [BookReviewsService, PrismaService],
  exports: [BookReviewsService],
})
export class BookReviewsModule { }
