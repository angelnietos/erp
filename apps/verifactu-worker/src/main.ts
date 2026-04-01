/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  /** Por defecto 3120: evita chocar con el API principal (3000) y verifactu-api (3110). */
  const port = Number(
    process.env.VERIFACTU_WORKER_PORT ?? process.env.PORT ?? 3120,
  );
  await app.listen(port);
  Logger.log(
    `🚀 Verifactu worker: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
