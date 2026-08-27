import { BadRequestException, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { v2 as cloudinary } from 'cloudinary';

import { Readable } from 'node:stream';

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),

      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),

      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async uploadProfileImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Profile image is required.');
    }

    return new Promise<{
      url: string;
      publicId: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'qufo/profile-photos',

          resource_type: 'image',

          transformation: [
            {
              width: 512,
              height: 512,
              crop: 'fill',
              gravity: 'face',
            },

            {
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },

        (error, result) => {
          if (error) {
            reject(new Error(error.message || 'Cloudinary upload failed.'));

            return;
          }

          if (!result) {
            reject(new Error('Cloudinary upload failed.'));

            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string) {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  }
}
