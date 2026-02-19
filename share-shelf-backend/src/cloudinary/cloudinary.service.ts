import { Injectable, Inject } from '@nestjs/common';
import { UploadApiResponse, v2 as CloudinaryType } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof CloudinaryType) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream({ folder: 'posts' }, (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('Upload failed: no result returned'));
          resolve(result);
        })
        .end(file.buffer);
    });
  }
}
