import { InjectionToken } from '@angular/core';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

export interface KeycloakUser {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
}