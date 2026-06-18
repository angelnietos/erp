import type { BffSessionRecord } from './bff-session.entity';

export const BFF_SESSION_RENEWER = Symbol('BFF_SESSION_RENEWER');

export interface BffTokenRenewalResult {
  accessToken: string;
  refreshToken?: string;
}

/** Renueva el JWT ERP almacenado en la sesión BFF (implementado en identity backend). */
export interface BffSessionRenewerPort {
  renewAccessToken(session: BffSessionRecord): Promise<BffTokenRenewalResult | null>;
}
