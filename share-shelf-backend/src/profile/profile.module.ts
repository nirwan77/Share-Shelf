import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProfileController],
  imports: [AuthModule],
  providers: [ProfileService],
})
export class ProfileModule {}
