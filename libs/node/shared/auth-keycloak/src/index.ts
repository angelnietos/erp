export * from './lib/bff/bff-auth.module';
export * from './lib/bff/bff-session.entity';
export * from './lib/bff/bff-session.store';
export * from './lib/bff/bff-cookie.util';
export * from './lib/bff/keycloak-token.client';
export * from './lib/bff/bff-session.middleware';

export * from './lib/auth-keycloak.module';
export * from './lib/domain/ports/keycloak-user.port';
export * from './lib/domain/ports/keycloak.config';
export * from './lib/infrastructure/keycloak.strategy';
export * from './lib/infrastructure/keycloak.guard';
export * from './lib/application/services/keycloak-token.service';
export * from './lib/utils/role-mapper';

// Re-export as auth-keycloak for shorter import
export { KeycloakAuthModule as AuthKeycloakModule } from './lib/auth-keycloak.module';
export { KeycloakStrategy } from './lib/infrastructure/keycloak.strategy';
export { KeycloakAuthGuard, OptionalKeycloakAuthGuard } from './lib/infrastructure/keycloak.guard';
export { KeycloakTokenService } from './lib/application/services/keycloak-token.service';
export { mapKeycloakRolesToErp } from './lib/utils/role-mapper';
export { KeycloakToken, ErpMappedUser } from './lib/domain/entities/keycloak-token.entity';