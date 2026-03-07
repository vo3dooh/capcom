import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

function resolveStorageDir(): string {
  const candidates = [
    path.join(process.cwd(), 'storage'),
    path.join(__dirname, '..', 'storage'),
    path.join(__dirname, '..', '..', 'storage'),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
  }

  return candidates[0];
}

async function bootstrap() {
  Logger.overrideLogger(['log', 'warn', 'error']);

  const app = await NestFactory.create(AppModule);

  app.use('/static', express.static(resolveStorageDir()));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:5173', 'http://192.168.0.14:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://0.0.0.0:${port}`);
}
bootstrap();
