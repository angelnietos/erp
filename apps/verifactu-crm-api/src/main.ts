import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

loadEnv({ path: join(process.cwd(), 'apps/verifactu-crm-api/.env') });
loadEnv({ path: join(process.cwd(), '.env') });

const DEFAULT_CORS_ORIGIN = 'http://localhost:4230';
const DEFAULT_API_PORT = 3120;

function parseCorsOrigins(): string | string[] {
  const raw = process.env['CORS_ORIGIN'] ?? DEFAULT_CORS_ORIGIN;
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) {
    return DEFAULT_CORS_ORIGIN;
  }
  if (list.length === 1) {
    const single = list[0];
    return single === undefined ? DEFAULT_CORS_ORIGIN : single;
  }
  return list;
}

function parsePort(): number {
  const raw = process.env['PORT'];
  const n = raw === undefined || raw === '' ? DEFAULT_API_PORT : Number(raw);
  if (!Number.isInteger(n) || n <= 0 || n > 65535) {
    throw new Error(
      `PORT must be an integer between 1 and 65535 (got ${raw ?? 'empty'})`,
    );
  }
  return n;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      /** La UI de Swagger usa scripts inline; el resto son respuestas JSON bajo `/api`. */
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Tenant-Id'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const swagger = new DocumentBuilder()
    .setTitle('Generic CRM API')
    .setDescription(
      'API multi-tenant: identidad, clientes, cola Verifactu (AEAT).',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'x-tenant-id', in: 'header' },
      'tenant-id',
    )
    .build();
  SwaggerModule.setup(
    `${globalPrefix}/docs`,
    app,
    SwaggerModule.createDocument(app, swagger),
  );

  const port = parsePort();
  await app.listen(port);
  Logger.log(
    `API: http://localhost:${port}/${globalPrefix} — docs: /${globalPrefix}/docs`,
    'Bootstrap',
  );
}

bootstrap().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  Logger.error(message, stack, 'Bootstrap');
  process.exit(1);
});
