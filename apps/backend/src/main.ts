import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

loadEnv({ path: 'apps/backend/.env' });
loadEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (ADR-009)
  app.use(helmet());

  // CORS — restrict to authorized origins in production via env var
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
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
      'OpenAPI — Fase 3: analytics, integraciones, eventos de dominio y módulos de negocio.',
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
