/** Credenciales + perfil mínimo tras carga para login (sin Prisma). */
export interface UserForLogin {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    passwordHash: string;
    isActive: boolean;
    roleNames: string[];
    extraPermissions: string[];
}
/** Usuario activo para sesión (sin hash). */
export interface UserSession {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    roleNames: string[];
    permissions: string[];
}
/** Perfil público para /users/me. */
export interface UserProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    roles: Array<{
        name: string;
        permissions: string[];
    }>;
}
