import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerifactuCredentialEnvironment } from '@generic-crm/prisma-client';
import { PrismaVerifactuCredentialRepository } from './prisma-verifactu-credential.repository';

/**
 * Resuelve PEM de cliente mTLS para un envío: primero credenciales del tenant en BD,
 * si no hay, rutas globales en env (AEAT_TLS_CLIENT_*).
 */
@Injectable()
export class VerifactuTenantTlsService {
  private readonly log = new Logger(VerifactuTenantTlsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly credentials: PrismaVerifactuCredentialRepository,
  ) {}

  /**
   * Entorno AEAT activo en este proceso (worker/API), alineado con AEAT_SUBMISSION_ENV.
   */
  activeCredentialEnvironment(): VerifactuCredentialEnvironment {
    const prod =
      (this.str('AEAT_SUBMISSION_ENV') || '').toLowerCase() === 'production';
    return prod
      ? VerifactuCredentialEnvironment.PRODUCTION
      : VerifactuCredentialEnvironment.TEST;
  }

  async resolveForSubmit(tenantId: string): Promise<{
    clientCertPem: string;
    clientKeyPem: string;
    source: 'tenant' | 'env_paths';
  } | null> {
    const env = this.activeCredentialEnvironment();
    try {
      const fromDb = await this.credentials.getDecryptedPem(tenantId, env);
      if (fromDb) {
        return {
          clientCertPem: fromDb.certPem,
          clientKeyPem: fromDb.keyPem,
          source: 'tenant',
        };
      }
    } catch (e) {
      this.log.warn(
        `No se pudieron descifrar credenciales AEAT del tenant ${tenantId}: ${e instanceof Error ? e.message : e}`,
      );
    }

    const certPath = this.str('AEAT_TLS_CLIENT_CERT_PATH');
    const keyPath = this.str('AEAT_TLS_CLIENT_KEY_PATH');
    if (certPath && keyPath) {
      const { readFileSync } = await import('node:fs');
      return {
        clientCertPem: readFileSync(certPath, 'utf8'),
        clientKeyPem: readFileSync(keyPath, 'utf8'),
        source: 'env_paths',
      };
    }

    return null;
  }

  private str(key: string): string {
    return (this.config.get<string>(key) ?? process.env[key] ?? '').trim();
  }
}
