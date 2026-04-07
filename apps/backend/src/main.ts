import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

loadEnv({ path: 'apps/backend/.env' });
loadEnv();

function parseCorsOrigins(): string | string[] {
  const raw = process.env.CORS_ORIGIN ?? 'http://localhost:4200';
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length <= 1 ? (list[0] ?? raw) : list;
}

function attachSlidingWindowRateLimit(
  app: INestApplication,
  path: string,
  envKey: string,
) {
  const max = parseInt(process.env[envKey] ?? '0', 10);
  if (!Number.isFinite(max) || max <= 0) {
    return;
  }
  const expressApp = app.getHttpAdapter().getInstance();
  const buckets = new Map<string, number[]>();
  const windowMs = 60_000;
  expressApp.use(path, (req, res, next) => {
    const ip = (req.ip || req.socket?.remoteAddress || 'unknown') as string;
    const now = Date.now();
    const hits = (buckets.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (hits.length >= max) {
      res.status(429).json({ status: 'error', message: 'Too many requests' });
      return;
    }
    hits.push(now);
    buckets.set(ip, hits);
    next();
  });
}

function attachPublicRateLimits(app: INestApplication) {
  attachSlidingWindowRateLimit(
    app,
    '/api/health',
    'RATE_LIMIT_HEALTH_PER_MINUTE',
  );
  attachSlidingWindowRateLimit(
    app,
    '/api/auth/login',
    'RATE_LIMIT_LOGIN_PER_MINUTE',
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (ADR-009)
  app.use(helmet());

  attachPublicRateLimits(app);

  // CORS — uno o varios orígenes (coma) vía CORS_ORIGIN
  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
  });

  // Auto-validation + serialization for all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,       // auto-transform payloads to DTO class instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Josanz ERP API')
    .setDescription(
      'OpenAPI — Fase 4: persistencia (recibos, eventos, webhooks), exportes informe y salud API.',
    )
    .setVersion('3.0.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'x-tenant-id', in: 'header' },
      'tenant-id',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Josanz ERP API running on: http://localhost:${port}/${globalPrefix}`,
    'Bootstrap',
  );
  Logger.log(
    `📘 OpenAPI (Swagger UI): http://localhost:${port}/${globalPrefix}/docs`,
    'Bootstrap',
  );
}

bootstrap();
