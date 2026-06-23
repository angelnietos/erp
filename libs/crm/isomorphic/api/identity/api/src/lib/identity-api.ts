/** Contrato HTTP compartido (front + back). Prefijo global `api` lo añade el host. */
export const identityPaths = {
  login: 'auth/login',
  oidcCallback: 'auth/oidc/callback',
  session: 'auth/session',
  usersMe: 'users/me',
} as const;

export interface LoginRequestBody {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface LoginResponse {
  accessToken: string;
  tenantId: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    roles: string[];
    permissions: string[];
  };
}

/** GET auth/session (usuario autenticado + permisos efectivos). */
export interface SessionResponse {
  tenantId: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    roles: string[];
    permissions: string[];
  };
}

/** GET users/me (perfil; el API puede devolver null). */
export interface UserMeResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  roles: Array<{ name: string; permissions: string[] }>;
}
