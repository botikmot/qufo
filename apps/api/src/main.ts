import { ValidationPipe } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const webUrl =
    configService.get<string>('WEB_URL') ?? 'http://localhost:3000';

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  app.enableCors({
    origin: webUrl,
    credentials: true,
  });

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
