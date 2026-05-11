import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ReadingGoalsController } from './reading-goals.controller';
import { ReadingGoalsService } from './reading-goals.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [NotificationsModule, AuthModule],
  controllers: [ReadingGoalsController],
  providers: [ReadingGoalsService],
  exports: [ReadingGoalsService],
})
export class ReadingGoalsModule {}
