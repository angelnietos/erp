/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app/app.module';

function parseCorsOrigins(): string[] | '*' {
  const raw = process.env.VERIFACTU_CORS_ORIGINS?.trim();
  if (raw === '*') {
    return '*';
  }
  const list = (raw ?? 'http://localhost:4200,http://127.0.0.1:4200')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : '*';
}

function isCorsOriginAllowed(origins: string[] | '*', origin: string | undefined): origin is string {
  if (!origin) return false;
  if (origins === '*') return true;
  return origins.includes(origin);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = parseCorsOrigins();

  /** Responde al preflight antes del enrutado (evita 404 y respuestas sin cabeceras CORS). */
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'OPTIONS') {
      return next();
    }
    const origin = req.headers.origin;
    if (!isCorsOriginAllowed(corsOrigins, origin)) {
      return next();
    }
    const reqHdrs = req.headers['access-control-request-headers'];
    res.status(204);
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      typeof reqHdrs === 'string'
        ? reqHdrs
        : 'Content-Type, Accept, Authorization, x-tenant-id, x-api-key, X-Requested-With',
    );
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.end();
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'x-tenant-id',
      'x-api-key',
      'X-Requested-With',
    ],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Verifactu API')
    .setDescription('Verifactu multi-tenant API')
    .setVersion('1.0.0')
    .addApiKey(
      { type: 'apiKey', name: 'x-api-key', in: 'header' },
      'api-key',
    )
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, swaggerDoc);

  const port = process.env.VERIFACTU_PORT || 3100;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
