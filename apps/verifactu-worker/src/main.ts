/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as loadEnv } from 'dotenv';
import { AppModule } from './app/app.module';

loadEnv({ path: 'apps/backend/.env' });
loadEnv({ path: 'apps/verifactu-worker/.env' });
loadEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  /** Por defecto 3130: evita chocar con verifactu-crm-api (3120) y ERP API (3000). */
  const port = Number(
    process.env.VERIFACTU_WORKER_PORT ?? process.env.PORT ?? 3130,
  );
  await app.listen(port);
  Logger.log(
    `🚀 Verifactu worker: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
