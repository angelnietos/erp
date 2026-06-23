import type { UserForLogin, UserProfile, UserSession } from './user-auth.types';
export declare const USER_AUTH_REPOSITORY: unique symbol;
export interface UserAuthRepositoryPort {
    findForLogin(tenantId: string, emailNormalized: string): Promise<UserForLogin | null>;
    findActiveSession(tenantId: string, userId: string): Promise<Omit<UserSession, 'permissions'> | null>;
    getEffectivePermissions(tenantId: string, userId: string): Promise<string[]>;
    findProfile(tenantId: string, userId: string): Promise<UserProfile | null>;
}
