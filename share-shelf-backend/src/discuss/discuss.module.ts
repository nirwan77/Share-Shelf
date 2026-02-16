import { Module } from '@nestjs/common';
import { DiscussService } from './discuss.service';
import { DiscussController } from './discuss.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DiscussController],
  providers: [DiscussService],
  imports: [AuthModule],
})
export class DiscussModule {}
