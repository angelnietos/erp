import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { type StringValue } from 'ms';
import { BffAuthModule, BFF_SESSION_RENEWER } from '@josanz-erp/auth-keycloak';
import { AuthController } from './presentation/controllers/auth.controller';
import { BffAuthController, BffPlatformAuthController } from './presentation/controllers/bff-auth.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { RolesController } from './presentation/controllers/roles.controller';
import { TenantModulesController } from './presentation/controllers/tenant-modules.controller';
import { PlatformTenantsController } from './presentation/controllers/platform-tenants.controller';
import { PlatformAuthController } from './presentation/controllers/platform-auth.controller';
import { AuthService } from './application/services/auth.service';
import { BffAuthService } from './application/services/bff-auth.service';
import { UsersService } from './application/services/users.service';
import { RolesService } from './application/services/roles.service';
import { TenantModulesService } from './application/services/tenant-modules.service';
import { TenantModulesNotifierService } from './application/services/tenant-modules-notifier.service';
import { TenantRealmSyncService } from './application/services/tenant-realm-sync.service';
import { TenantIdentityNotifierService } from './application/services/tenant-identity-notifier.service';
import { TenantModulesRealtimeGateway } from './infrastructure/realtime/tenant-modules-realtime.gateway';
import { PlatformOwnerGuard } from './presentation/guards/platform-owner.guard';
import { PlatformJwtGuard } from './presentation/guards/platform-jwt.guard';
import { HybridJwtStrategy } from './infrastructure/auth/hybrid-jwt.strategy';
import { PlatformJwtStrategy } from './infrastructure/auth/platform-jwt.strategy';
import { USER_REPOSITORY } from '@josanz-erp/identity-core';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { ErpBffSessionRenewer } from './infrastructure/bff/erp-bff-session-renewer';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';

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
        BffAuthModule.forRoot(),
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
      ],
      controllers: [
        AuthController,
        BffAuthController,
        BffPlatformAuthController,
        UsersController,
        RolesController,
        TenantModulesController,
        PlatformTenantsController,
        PlatformAuthController,
      ],
      providers: [
        AuthService,
        BffAuthService,
        UsersService,
        RolesService,
        TenantModulesService,
        TenantModulesNotifierService,
        TenantRealmSyncService,
        TenantIdentityNotifierService,
        TenantModulesRealtimeGateway,
        PlatformOwnerGuard,
        PlatformJwtGuard,
        HybridJwtStrategy, // Always use hybrid strategy (supports both JWT types)
        PlatformJwtStrategy, // Platform admin authentication (Keycloak)
        {
          provide: USER_REPOSITORY,
          useClass: PrismaUserRepository,
        },
        {
          provide: 'IDENTITY_CONFIG',
          useValue: options || {},
        },
        ErpBffSessionRenewer,
        {
          provide: BFF_SESSION_RENEWER,
          useExisting: ErpBffSessionRenewer,
        },
      ],
      exports: [AuthService, HybridJwtStrategy],
    };
  }
}