import { Module } from '@nestjs/common';
import { BookRequestsService } from './book-requests.service';
import { BookRequestsController } from './book-requests.controller';
import { PrismaModule } from 'src/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookRequestsController],
  providers: [BookRequestsService],
})
export class BookRequestsModule {}
