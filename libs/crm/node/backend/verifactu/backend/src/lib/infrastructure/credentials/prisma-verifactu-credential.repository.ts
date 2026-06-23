import { BadRequestException, Injectable } from '@nestjs/common';
import { VerifactuCredentialEnvironment } from '@generic-crm/prisma-client';
import { createPrivateKey, X509Certificate } from 'node:crypto';
import { PrismaService } from '@generic-crm/shared-infrastructure';
import {
  decryptCredentialSecret,
  encryptCredentialSecret,
} from './verifactu-credential-crypto';

export type VerifactuCredentialEnvUi = 'test' | 'production';

function toPrismaEnv(
  env: VerifactuCredentialEnvUi,
): VerifactuCredentialEnvironment {
  return env === 'production'
    ? VerifactuCredentialEnvironment.PRODUCTION
    : VerifactuCredentialEnvironment.TEST;
}

@Injectable()
export class PrismaVerifactuCredentialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertPem(
    tenantId: string,
    environment: VerifactuCredentialEnvUi,
    certificatePem: string,
    privateKeyPem: string,
  ): Promise<{ certSubject: string | null; certValidTo: Date | null }> {
    const certPem = certificatePem.trim();
    const keyPem = privateKeyPem.trim();
    if (!certPem.includes('BEGIN CERTIFICATE')) {
      throw new BadRequestException('El certificado debe estar en PEM');
    }
    if (!keyPem.includes('BEGIN')) {
      throw new BadRequestException('La clave privada debe estar en PEM');
    }

    let certSubject: string | null = null;
    let certValidTo: Date | null = null;
    try {
      const x = new X509Certificate(certPem);
      certSubject = x.subject.length ? x.subject : null;
      certValidTo = x.validTo ? new Date(x.validTo) : null;
    } catch {
      throw new BadRequestException('Certificado X.509 PEM no válido');
    }
    try {
      createPrivateKey({ key: keyPem, format: 'pem' });
    } catch {
      throw new BadRequestException('Clave privada PEM no válida');
    }

    const env = toPrismaEnv(environment);
    await this.prisma.verifactuTenantCredential.upsert({
      where: {
        uq_verifactu_cred_tenant_env: { tenantId, environment: env },
      },
      create: {
        tenantId,
        environment: env,
        certEncrypted: encryptCredentialSecret(certPem),
        keyEncrypted: encryptCredentialSecret(keyPem),
        certSubject,
        certValidTo,
      },
      update: {
        certEncrypted: encryptCredentialSecret(certPem),
        keyEncrypted: encryptCredentialSecret(keyPem),
        certSubject,
        certValidTo,
      },
    });

    return { certSubject, certValidTo };
  }

  async getDecryptedPem(
    tenantId: string,
    environment: VerifactuCredentialEnvironment,
  ): Promise<{ certPem: string; keyPem: string } | null> {
    const row = await this.prisma.verifactuTenantCredential.findUnique({
      where: {
        uq_verifactu_cred_tenant_env: { tenantId, environment },
      },
    });
    if (!row) {
      return null;
    }
    return {
      certPem: decryptCredentialSecret(row.certEncrypted),
      keyPem: decryptCredentialSecret(row.keyEncrypted),
    };
  }

  async listStatus(tenantId: string): Promise<{
    test: {
      configured: boolean;
      certSubject: string | null;
      certValidTo: string | null;
      updatedAt: string | null;
    };
    production: {
      configured: boolean;
      certSubject: string | null;
      certValidTo: string | null;
      updatedAt: string | null;
    };
  }> {
    const rows = await this.prisma.verifactuTenantCredential.findMany({
      where: { tenantId },
    });
    const mapEnv = (e: VerifactuCredentialEnvironment) =>
      rows.find((r) => r.environment === e);
    const test = mapEnv(VerifactuCredentialEnvironment.TEST);
    const prod = mapEnv(VerifactuCredentialEnvironment.PRODUCTION);
    return {
      test: {
        configured: !!test,
        certSubject: test?.certSubject ?? null,
        certValidTo: test?.certValidTo?.toISOString() ?? null,
        updatedAt: test?.updatedAt.toISOString() ?? null,
      },
      production: {
        configured: !!prod,
        certSubject: prod?.certSubject ?? null,
        certValidTo: prod?.certValidTo?.toISOString() ?? null,
        updatedAt: prod?.updatedAt.toISOString() ?? null,
      },
    };
  }

  async deleteForTenant(
    tenantId: string,
    environment: VerifactuCredentialEnvUi,
  ): Promise<void> {
    const env = toPrismaEnv(environment);
    await this.prisma.verifactuTenantCredential.deleteMany({
      where: { tenantId, environment: env },
    });
  }
}
