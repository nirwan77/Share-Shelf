import { Module } from '@nestjs/common';
import { BookStatusService } from './book-status.service';
import { BookStatusController } from './book-status.controller';
import { PrismaModule } from '../prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookStatusController],
  providers: [BookStatusService],
})
export class BookStatusModule {}
