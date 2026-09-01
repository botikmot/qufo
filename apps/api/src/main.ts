import { ValidationPipe } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';

import { mkdir } from 'node:fs/promises';

import { resolve } from 'node:path';

import { static as expressStatic } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  const webUrl =
    configService.get<string>('WEB_URL') ?? 'http://localhost:3000';

  const storageDriver =
    configService.get<string>('STORAGE_DRIVER') ?? 'cloudinary';

  /*
   * IMPORTANT:
   * Register CORS BEFORE static files.
   *
   * Otherwise express.static may finish the
   * /uploads response before the CORS middleware
   * gets a chance to add its headers.
   */
  app.enableCors({
    origin: webUrl,
    credentials: true,
  });

  /*
   * Local/self-hosted uploads.
   */
  if (storageDriver === 'local') {
    const uploadDir = resolve(
      configService.get<string>('UPLOAD_DIR') ?? './uploads',
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    app.use(
      '/uploads',
      expressStatic(uploadDir, {
        index: false,

        /*
         * While developing local storage,
         * disable browser caching first.
         *
         * Once everything is stable we can
         * restore a longer cache time.
         */
        maxAge: 0,

        setHeaders: (res) => {
          res.setHeader('Access-Control-Allow-Origin', webUrl);

          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

          res.setHeader('Cache-Control', 'no-store');
        },
      }),
    );
  }

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
