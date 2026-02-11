import { Module } from '@nestjs/common';
import { TopupService } from './topup.service';
import { TopupController } from './topup.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TopupController],
  imports: [AuthModule],
  providers: [TopupService],
})
export class TopupModule {}
