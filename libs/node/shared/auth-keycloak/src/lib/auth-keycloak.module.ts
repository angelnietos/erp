import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from './infrastructure/keycloak.strategy';
import { KeycloakAuthGuard, OptionalKeycloakAuthGuard } from './infrastructure/keycloak.guard';
import { KeycloakTokenService } from './application/services/keycloak-token.service';

export interface KeycloakModuleOptions {
  enabled?: boolean;
  realm?: string;
  authServerUrl?: string;
}

@Global()
@Module({})
export class KeycloakAuthModule {
  static forRoot(options?: KeycloakModuleOptions): DynamicModule {
    if (options?.enabled === false) {
      return {
        module: KeycloakAuthModule,
        imports: [],
        providers: [],
        exports: [],
      };
    }

    return {
      module: KeycloakAuthModule,
      imports: [PassportModule, ConfigModule],
      providers: [
        KeycloakStrategy,
        KeycloakAuthGuard,
        OptionalKeycloakAuthGuard,
        KeycloakTokenService,
      ],
      exports: [
        KeycloakAuthGuard,
        OptionalKeycloakAuthGuard,
        KeycloakTokenService,
      ],
    };
  }
}