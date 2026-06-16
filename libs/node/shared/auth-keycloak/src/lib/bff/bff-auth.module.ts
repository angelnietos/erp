import { DynamicModule, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InMemoryBffSessionStore } from './bff-session.store';
import { KeycloakTokenClient } from './keycloak-token.client';
import { BffSessionMiddleware } from './bff-session.middleware';

export interface BffAuthModuleOptions {
  /** Habilita middleware de sesión + CSRF en rutas /api. */
  enabled?: boolean;
}

@Module({})
export class BffAuthModule implements NestModule {
  static forRoot(options?: BffAuthModuleOptions): DynamicModule {
    const enabled = options?.enabled ?? process.env['BFF_AUTH_ENABLED'] !== 'false';

    if (!enabled) {
      return {
        module: BffAuthModule,
        imports: [],
        providers: [],
        exports: [],
      };
    }

    return {
      module: BffAuthModule,
      imports: [ConfigModule],
      providers: [InMemoryBffSessionStore, KeycloakTokenClient],
      exports: [InMemoryBffSessionStore, KeycloakTokenClient],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    if (process.env['BFF_AUTH_ENABLED'] === 'false') {
      return;
    }
    consumer
      .apply(BffSessionMiddleware)
      .forRoutes({ path: 'api/*path', method: RequestMethod.ALL });
  }
}
