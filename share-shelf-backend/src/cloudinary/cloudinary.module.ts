import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { UploadController } from './cloudinary.controller';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  providers: [CloudinaryService, CloudinaryProvider],
  exports: [CloudinaryService, CloudinaryProvider],
  controllers: [UploadController],
})
export class CloudinaryModule {}
