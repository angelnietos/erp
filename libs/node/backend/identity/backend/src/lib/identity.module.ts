import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { type StringValue } from 'ms';
import { AuthController } from './presentation/controllers/auth.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { RolesController } from './presentation/controllers/roles.controller';
import { TenantModulesController } from './presentation/controllers/tenant-modules.controller';
import { PlatformTenantsController } from './presentation/controllers/platform-tenants.controller';
import { PlatformAuthController } from './presentation/controllers/platform-auth.controller';
import { AuthService } from './application/services/auth.service';
import { UsersService } from './application/services/users.service';
import { RolesService } from './application/services/roles.service';
import { TenantModulesService } from './application/services/tenant-modules.service';
import { TenantModulesNotifierService } from './application/services/tenant-modules-notifier.service';
import { TenantIdentityNotifierService } from './application/services/tenant-identity-notifier.service';
import { TenantModulesRealtimeGateway } from './infrastructure/realtime/tenant-modules-realtime.gateway';
import { PlatformOwnerGuard } from './presentation/guards/platform-owner.guard';
import { PlatformJwtGuard } from './presentation/guards/platform-jwt.guard';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { HybridJwtStrategy } from './infrastructure/auth/hybrid-jwt.strategy';
import { USER_REPOSITORY } from '@josanz-erp/identity-core';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';
import { KeycloakAuthModule } from '@josanz-erp/auth-keycloak';

export interface IdentityConfig {
  _isIdentityConfig?: boolean;
  useKeycloak?: boolean;
}

@Module({})
export class IdentityModule {
  static forRoot(options?: IdentityConfig): DynamicModule {
    const useKeycloak = options?.useKeycloak ?? process.env.KEYCLOAK_ENABLED === 'true';

    return {
      module: IdentityModule,
      imports: [
        PassportModule,
        PrismaModule,
        SharedInfrastructureModule,
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const expiresIn = (config.get<string>('JWT_EXPIRES') ??
              '24h') as StringValue;
            return {
              secret: config.get<string>('JWT_SECRET') ?? 'default_secret',
              signOptions: { expiresIn },
            };
          },
        }),
        useKeycloak ? KeycloakAuthModule.forRoot() : Module.forRoot({}),
      ],
      controllers: [
        AuthController,
        UsersController,
        RolesController,
        TenantModulesController,
        PlatformTenantsController,
        PlatformAuthController,
      ],
      providers: [
        AuthService,
        UsersService,
        RolesService,
        TenantModulesService,
        TenantModulesNotifierService,
        TenantIdentityNotifierService,
        TenantModulesRealtimeGateway,
        PlatformOwnerGuard,
        PlatformJwtGuard,
        useKeycloak ? HybridJwtStrategy : JwtStrategy,
        {
          provide: USER_REPOSITORY,
          useClass: PrismaUserRepository,
        },
        {
          provide: 'IDENTITY_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [AuthService, useKeycloak ? HybridJwtStrategy : JwtStrategy],
    };
  }
}
