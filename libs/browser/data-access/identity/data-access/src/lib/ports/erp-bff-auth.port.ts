import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPayload } from '@josanz-erp/identity-api';

export type ErpAuthSessionMode = 'bff' | 'legacy';

export interface ErpBffLoginResult {
  user: UserPayload;
  tenantId?: string;
  tenantSlug?: string;
  authMode: 'keycloak' | 'local';
  accessToken?: string;
  keycloakReachable?: boolean;
}

/** Puerto opcional: implementado por `BffAuthClient` en la app consumidora. */
export interface ErpBffAuthPort {
  isBffMode(): boolean;
  erpLogin(body: {
    email: string;
    password: string;
    tenantSlug?: string;
  }): Observable<ErpBffLoginResult>;
  erpCallbackWithCode(body: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
    tenantSlug?: string;
  }): Observable<ErpBffLoginResult>;
  erpSession(): Observable<ErpBffLoginResult>;
  erpLogout(): Observable<{ ok: true }>;
  clearErpCsrf(): void;
}

export const ERP_BFF_AUTH = new InjectionToken<ErpBffAuthPort>('ERP_BFF_AUTH');

export const ERP_AUTH_SESSION_MODE = new InjectionToken<{ mode: ErpAuthSessionMode }>(
  'ERP_AUTH_SESSION_MODE',
);
