// Shared interfaces for Identity domain
export interface UserPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: UserPayload;
  /** Resolved tenant UUID; store and send as x-tenant-id on subsequent API calls. */
  tenantId: string;
}

// DTOs shared between Backend and Frontend (no decorators - pure types)
export interface LoginCredentials {
  email: string;
  password: string;
  /** When no x-tenant-id header is sent, backend resolves tenant by slug (e.g. "josanz"). */
  tenantSlug?: string;
}
