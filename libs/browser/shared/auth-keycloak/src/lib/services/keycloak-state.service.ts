import { Injectable, inject } from '@angular/core';
import { KeycloakService, KeycloakUser } from '../services/keycloak.service';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { UserPayload } from '@josanz-erp/identity-api';

@Injectable({ providedIn: 'root' })
export class KeycloakStateService {
  private readonly keycloakService = inject(KeycloakService);
  private readonly globalAuthStore = inject(GlobalAuthStore);

  syncWithGlobalStore(): void {
    const keycloakUser = this.keycloakService.getKeycloakUser();
    if (keycloakUser) {
      const userPayload: UserPayload = {
        id: keycloakUser.id,
        email: keycloakUser.email,
        firstName: keycloakUser.firstName,
        lastName: keycloakUser.lastName,
        roles: keycloakUser.roles,
        permissions: keycloakUser.permissions,
      };

      const displayName = [keycloakUser.firstName, keycloakUser.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || keycloakUser.email;

      this.globalAuthStore.setUser({
        id: keycloakUser.id,
        email: keycloakUser.email,
        name: displayName,
        tenantId: keycloakUser.tenantId,
        permissions: keycloakUser.permissions,
      });
    }
  }
}