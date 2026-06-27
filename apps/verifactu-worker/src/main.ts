/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as loadEnv } from 'dotenv';
import { AppModule } from './app/app.module';

loadEnv({ path: 'apps/verifactu-worker/.env' });
loadEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  /** 3130 por defecto — no usar `PORT` del monorepo (3000 = ERP backend). */
  const port = Number(process.env.VERIFACTU_WORKER_PORT ?? 3130);
  await app.listen(port);
  Logger.log(
    `🚀 Verifactu worker: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
