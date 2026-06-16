import type { BffSessionRecord } from './bff-session.entity';

export const BFF_SESSION_RENEWER = Symbol('BFF_SESSION_RENEWER');

/** Renueva el JWT ERP almacenado en la sesión BFF (implementado en identity backend). */
export interface BffSessionRenewerPort {
  renewAccessToken(session: BffSessionRecord): Promise<string | null>;
}
