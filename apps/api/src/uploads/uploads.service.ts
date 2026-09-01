import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { v2 as cloudinary } from 'cloudinary';

import { randomBytes } from 'node:crypto';

import { mkdir, unlink, writeFile } from 'node:fs/promises';

import { resolve, sep } from 'node:path';

import { Readable } from 'node:stream';

import sharp from 'sharp';

type StorageDriver = 'cloudinary' | 'local';

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {
    /*
     * IMPORTANT:
     *
     * Only require Cloudinary credentials when
     * STORAGE_DRIVER=cloudinary.
     *
     * Self-hosted installations therefore do not
     * need any Cloudinary configuration at all.
     */
    if (this.storageDriver === 'cloudinary') {
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
  }

  /*
   * ----------------------------------------------------------------
   * Configuration
   * ----------------------------------------------------------------
   */

  private get storageDriver(): StorageDriver {
    const value =
      this.configService.get<string>('STORAGE_DRIVER') ?? 'cloudinary';

    if (value !== 'cloudinary' && value !== 'local') {
      throw new Error(`Unsupported STORAGE_DRIVER: ${value}`);
    }

    return value;
  }

  private get uploadDirectory(): string {
    return resolve(this.configService.get<string>('UPLOAD_DIR') ?? './uploads');
  }

  private get localUploadPublicUrl(): string {
    return (
      this.configService.get<string>('LOCAL_UPLOAD_PUBLIC_URL') ??
      'http://localhost:3001/uploads'
    ).replace(/\/$/, '');
  }

  /*
   * ----------------------------------------------------------------
   * Validation helpers
   * ----------------------------------------------------------------
   */

  private validateImage(
    file: Express.Multer.File,
    label: string,
    maxSize = 5 * 1024 * 1024,
  ) {
    if (!file) {
      throw new BadRequestException(`${label} is required.`);
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, and WEBP images are allowed.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `${label} must not exceed ${Math.round(maxSize / 1024 / 1024)} MB.`,
      );
    }
  }

  private getExtensionFromMimeType(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpg';

      case 'image/png':
        return 'png';

      case 'image/webp':
        return 'webp';

      default:
        throw new BadRequestException('Unsupported image type.');
    }
  }

  /*
   * ----------------------------------------------------------------
   * Local storage helpers
   * ----------------------------------------------------------------
   */

  private async saveLocalImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{
    url: string;
    key: string;
  }> {
    let extension = this.getExtensionFromMimeType(file.mimetype);

    let buffer = file.buffer;

    /*
     * @react-pdf/renderer is safest with
     * JPEG and PNG sources.
     *
     * Browsers can display WebP normally,
     * but PDFs may fail to render it.
     *
     * For local/self-hosted storage,
     * normalize WebP uploads to PNG.
     */
    if (file.mimetype === 'image/webp') {
      buffer = await sharp(file.buffer)
        .png({
          compressionLevel: 9,
        })
        .toBuffer();

      extension = 'png';
    }

    const filename = `${Date.now()}-${randomBytes(12).toString(
      'hex',
    )}.${extension}`;

    const relativeKey = `${folder}/${filename}`;

    const directoryPath = resolve(this.uploadDirectory, folder);

    await mkdir(directoryPath, {
      recursive: true,
    });

    const filePath = resolve(this.uploadDirectory, relativeKey);

    const uploadRoot = `${this.uploadDirectory}${sep}`;

    if (filePath !== this.uploadDirectory && !filePath.startsWith(uploadRoot)) {
      throw new InternalServerErrorException('Invalid upload path.');
    }

    await writeFile(filePath, buffer);

    return {
      url: `${this.localUploadPublicUrl}/${relativeKey}`,

      key: `local:${relativeKey}`,
    };
  }

  private async deleteLocalImage(storageKey: string) {
    if (!storageKey.startsWith('local:')) {
      return;
    }

    const relativeKey = storageKey.slice('local:'.length);

    if (!relativeKey) {
      return;
    }

    const filePath = resolve(this.uploadDirectory, relativeKey);

    const uploadRoot = `${this.uploadDirectory}${sep}`;

    if (filePath !== this.uploadDirectory && !filePath.startsWith(uploadRoot)) {
      return;
    }

    try {
      await unlink(filePath);
    } catch (error: unknown) {
      /*
       * Removing a missing file should not break
       * profile/logo removal.
       */
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return;
      }

      throw error;
    }
  }

  /*
   * ----------------------------------------------------------------
   * Profile image
   * ----------------------------------------------------------------
   */

  async uploadProfileImage(file: Express.Multer.File) {
    this.validateImage(file, 'Profile image', 5 * 1024 * 1024);

    if (this.storageDriver === 'local') {
      const uploaded = await this.saveLocalImage(file, 'profile-photos');

      return {
        url: uploaded.url,
        publicId: uploaded.key,
      };
    }

    return new Promise<{
      url: string;
      publicId: string;
    }>((resolvePromise, reject) => {
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

          resolvePromise({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  /*
   * ----------------------------------------------------------------
   * Business logo
   * ----------------------------------------------------------------
   */

  async uploadBusinessLogo(file: Express.Multer.File, organizationId: string) {
    this.validateImage(file, 'Business logo', 5 * 1024 * 1024);

    if (this.storageDriver === 'local') {
      const uploaded = await this.saveLocalImage(
        file,
        `business-logos/${organizationId}`,
      );

      return {
        url: uploaded.url,
        publicId: uploaded.key,
      };
    }

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolvePromise, reject) => {
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
            reject(new Error(error.message || 'Business logo upload failed.'));

            return;
          }

          if (!uploadResult) {
            reject(new Error('Business logo upload failed.'));

            return;
          }

          resolvePromise({
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

  /*
   * ----------------------------------------------------------------
   * Quotation item image
   * ----------------------------------------------------------------
   */

  async uploadQuotationItemImage(
    file: Express.Multer.File,
    organizationId: string,
  ) {
    this.validateImage(file, 'Quotation item image', 5 * 1024 * 1024);

    if (this.storageDriver === 'local') {
      const uploaded = await this.saveLocalImage(
        file,
        `quotation-items/${organizationId}`,
      );

      return {
        url: uploaded.url,

        /*
         * Same provider-neutral field already
         * used by QuotationItem/JobItem.
         */
        imageKey: uploaded.key,
      };
    }

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolvePromise, reject) => {
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
            reject(
              new Error(error.message || 'Quotation item image upload failed.'),
            );

            return;
          }

          if (!uploadResult) {
            reject(new Error('Quotation item image upload failed.'));

            return;
          }

          resolvePromise({
            secure_url: uploadResult.secure_url,

            public_id: uploadResult.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,

      imageKey: result.public_id,
    };
  }

  /*
   * ----------------------------------------------------------------
   * Generic deletion
   * ----------------------------------------------------------------
   */

  async deleteImage(storageKey: string) {
    if (!storageKey) {
      return;
    }

    /*
     * Local files identify themselves through
     * the local: prefix.
     */
    if (storageKey.startsWith('local:')) {
      await this.deleteLocalImage(storageKey);

      return;
    }

    /*
     * Existing SaaS records contain raw
     * Cloudinary public IDs.
     *
     * Never require Cloudinary credentials on a
     * self-hosted installation just to delete an
     * unknown/legacy key.
     */
    if (this.storageDriver !== 'cloudinary') {
      return;
    }

    await cloudinary.uploader.destroy(storageKey, {
      invalidate: true,
      resource_type: 'image',
    });
  }

  async uploadQuotationSignature(
    file: Express.Multer.File,
    organizationId: string,
  ) {
    this.validateImage(file, 'Quotation signature', 2 * 1024 * 1024);

    /*
     * Self-hosted.
     */
    if (this.storageDriver === 'local') {
      const uploaded = await this.saveLocalImage(
        file,
        `quotation-signatures/${organizationId}`,
      );

      return {
        url: uploaded.url,
        signatureKey: uploaded.key,
      };
    }

    /*
     * QUFO SaaS / Cloudinary.
     */
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolvePromise, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `qufo/quotation-signatures/${organizationId}`,

          resource_type: 'image',

          transformation: [
            {
              width: 1000,
              height: 500,
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
            reject(
              new Error(error.message || 'Quotation signature upload failed.'),
            );

            return;
          }

          if (!uploadResult) {
            reject(new Error('Quotation signature upload failed.'));

            return;
          }

          resolvePromise({
            secure_url: uploadResult.secure_url,

            public_id: uploadResult.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      signatureKey: result.public_id,
    };
  }
}
