import type { UserForLogin, UserProfile, UserSession } from './user-auth.types';

export const USER_AUTH_REPOSITORY = Symbol('USER_AUTH_REPOSITORY');

export interface UserAuthRepositoryPort {
  findForLogin(
    tenantId: string,
    emailNormalized: string,
  ): Promise<UserForLogin | null>;

  findActiveSession(
    tenantId: string,
    userId: string,
  ): Promise<Omit<UserSession, 'permissions'> | null>;

  getEffectivePermissions(tenantId: string, userId: string): Promise<string[]>;

  findProfile(tenantId: string, userId: string): Promise<UserProfile | null>;
}
