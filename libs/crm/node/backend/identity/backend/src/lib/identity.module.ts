import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { SharedInfrastructureModule } from '@generic-crm/shared-infrastructure';
import {
  AUTH_TOKEN_PORT,
  TENANT_READ_REPOSITORY,
  USER_AUTH_REPOSITORY,
} from '@generic-crm/identity-core';
import { AuthApplicationService } from './application/auth.application.service';
import { NestJwtAuthTokenAdapter } from './infrastructure/auth/nest-jwt-auth-token.adapter';
import { PrismaTenantReadRepository } from './infrastructure/persistence/prisma-tenant-read.repository';
import { PrismaUserAuthRepository } from './infrastructure/persistence/prisma-user-auth.repository';
import { AuthController } from './presentation/auth.controller';
import { UsersController } from './presentation/users.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SharedInfrastructureModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev_change_me',
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES') ?? '8h') as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    AuthApplicationService,
    JwtStrategy,
    PrismaUserAuthRepository,
    PrismaTenantReadRepository,
    NestJwtAuthTokenAdapter,
    {
      provide: USER_AUTH_REPOSITORY,
      useExisting: PrismaUserAuthRepository,
    },
    {
      provide: TENANT_READ_REPOSITORY,
      useExisting: PrismaTenantReadRepository,
    },
    {
      provide: AUTH_TOKEN_PORT,
      useExisting: NestJwtAuthTokenAdapter,
    },
  ],
  exports: [AuthApplicationService, JwtModule],
})
export class IdentityModule {}
