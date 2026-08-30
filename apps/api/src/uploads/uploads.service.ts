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
    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });
  }

  async uploadBusinessLogo(file: Express.Multer.File, organizationId: string) {
    if (!file) {
      throw new BadRequestException('Business logo file is required');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, and WEBP images are allowed',
      );
    }

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'qufo/business-logos',

          public_id: organizationId,

          overwrite: true,

          invalidate: true,

          resource_type: 'image',

          transformation: [
            {
              width: 1000,
              height: 1000,
              crop: 'limit',
              quality: 'auto',
            },
          ],
        },
        (error, uploadResult) => {
          if (error) {
            return reject(
              new Error(error.message || 'Business logo upload failed'),
            );
          }

          if (!uploadResult) {
            return reject(new Error('Business logo upload failed'));
          }

          resolve({
            secure_url: uploadResult.secure_url,

            public_id: uploadResult.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async uploadQuotationItemImage(
    file: Express.Multer.File,
    organizationId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Quotation item image is required.');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, and WEBP images are allowed.',
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException(
        'Quotation item image must not exceed 5 MB.',
      );
    }

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `qufo/quotation-items/${organizationId}`,

          resource_type: 'image',

          transformation: [
            {
              width: 1600,
              height: 1600,
              crop: 'limit',
            },

            {
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },

        (error, uploadResult) => {
          if (error) {
            return reject(
              new Error(error.message || 'Quotation item image upload failed.'),
            );
          }

          if (!uploadResult) {
            return reject(new Error('Quotation item image upload failed.'));
          }

          resolve({
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,

      // Cloudinary public_id stored as our provider-neutral imageKey
      imageKey: result.public_id,
    };
  }
}
