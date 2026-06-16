import { DynamicModule, Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  InMemoryBffSessionStore,
  provideBffSessionStore,
  BFF_SESSION_STORE,
} from './bff-session.store';
import { KeycloakTokenClient } from './keycloak-token.client';
import { BffSessionMiddleware } from './bff-session.middleware';

export interface BffAuthModuleOptions {
  /** Habilita middleware de sesión + CSRF en rutas /api. */
  enabled?: boolean;
}

@Global()
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
      global: true,
      imports: [ConfigModule],
      providers: [
        InMemoryBffSessionStore,
        provideBffSessionStore(),
        KeycloakTokenClient,
        BffSessionMiddleware,
      ],
      exports: [
        InMemoryBffSessionStore,
        BFF_SESSION_STORE,
        KeycloakTokenClient,
        BffSessionMiddleware,
      ],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    if (process.env['BFF_AUTH_ENABLED'] === 'false') {
      return;
    }
    consumer
      .apply(BffSessionMiddleware)
      .forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}
