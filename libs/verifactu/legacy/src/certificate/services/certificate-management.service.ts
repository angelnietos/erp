import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CertificateService, CertificateInfo } from '../certificate.service';
import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';

export interface CertificateValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: CertificateInfo | null;
}

/**
 * Certificate Management Service
 * Servicio avanzado de gestión de certificados con validaciones y mejoras
 */
@Injectable()
export class CertificateManagementService {
  private readonly logger = new Logger(CertificateManagementService.name);

  constructor(
    private certificateService: CertificateService,
    private configService: ConfigService,
  ) {}

  /**
   * Validate certificate file before upload
   */
  async validateCertificateFile(
    filePath: string,
    password: string,
  ): Promise<CertificateValidationResult> {
    const result: CertificateValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      info: null,
    };

    try {
      // Check file exists
      if (!fs.existsSync(filePath)) {
        result.valid = false;
        result.errors.push('El archivo de certificado no existe');
        return result;
      }

      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext !== '.pfx' && ext !== '.p12') {
        result.valid = false;
        result.errors.push('El archivo debe ser un certificado PFX o P12');
        return result;
      }

      // Check file size (max 10MB)
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      if (fileSizeInMB > 10) {
        result.valid = false;
        result.errors.push('El archivo de certificado es demasiado grande (máximo 10MB)');
        return result;
      }

      // Try to load and parse certificate
      try {
        const pfxData = fs.readFileSync(filePath);
        const pfxAsn1 = forge.asn1.fromDer(pfxData.toString('binary'));
        const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

        // Extract certificate
        const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
        const certBag = certBags[forge.pki.oids.certBag];

        if (!certBag || certBag.length === 0) {
          result.valid = false;
          result.errors.push('No se encontró ningún certificado en el archivo');
          return result;
        }

        const certificate = certBag[0].cert;
        if (!certificate) {
          result.valid = false;
          result.errors.push('El certificado no es válido');
          return result;
        }

        // Extract private key
        const keyBags = pfx.getBags({
          bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
        });
        const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

        if (!keyBag || keyBag.length === 0) {
          result.valid = false;
          result.errors.push('No se encontró la clave privada en el certificado');
          return result;
        }

        // Validate certificate dates
        const now = new Date();
        const validFrom = certificate.validity.notBefore;
        const validTo = certificate.validity.notAfter;

        if (now < validFrom) {
          result.warnings.push('El certificado aún no es válido');
        }

        if (now > validTo) {
          result.valid = false;
          result.errors.push('El certificado ha expirado');
        }

        // Check expiration soon (30 days)
        const daysUntilExpiry =
          (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysUntilExpiry < 30 && daysUntilExpiry > 0) {
          result.warnings.push(
            `El certificado expira en ${Math.round(daysUntilExpiry)} días`,
          );
        }

        // Extract certificate info
        const subject = certificate.subject;
        const issuer = certificate.issuer;

        // Try to extract NIF from subject
        let nif = '';
        const nifAttr = subject.getField('serialNumber');
        if (nifAttr) {
          nif = nifAttr.value;
        }

        // Extract company name
        let companyName = '';
        const cnAttr = subject.getField('CN');
        if (cnAttr) {
          companyName = cnAttr.value;
        }

        result.info = {
          subject: subject.toString(),
          issuer: issuer.toString(),
          serialNumber: certificate.serialNumber,
          validFrom,
          validTo,
          thumbprint: this.calculateThumbprint(certificate),
          nif,
          companyName,
        };

        // Validate NIF format if present
        if (nif && !/^[A-Z0-9]{9}$/i.test(nif)) {
          result.warnings.push('El NIF extraído del certificado no tiene el formato esperado');
        }
      } catch (parseError) {
        const err = parseError as Error;
        result.valid = false;
        if (err.message.includes('password')) {
          result.errors.push('La contraseña del certificado es incorrecta');
        } else {
          result.errors.push(`Error al leer el certificado: ${err.message}`);
        }
      }
    } catch (error) {
      const err = error as Error;
      result.valid = false;
      result.errors.push(`Error al validar el certificado: ${err.message}`);
    }

    return result;
  }

  /**
   * Calculate certificate thumbprint (SHA-256)
   */
  private calculateThumbprint(certificate: forge.pki.Certificate): string {
    const der = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate));
    const md = forge.md.sha256.create();
    md.update(der.getBytes());
    return md.digest().toHex().toUpperCase();
  }

  /**
   * Get certificate expiration info
   */
  async getCertificateExpirationInfo(): Promise<{
    expiresIn: number;
    expiresAt: Date | null;
    isExpired: boolean;
    daysUntilExpiry: number;
  }> {
    try {
      const certInfo = await this.certificateService.getCertificateInfo();
      if (!certInfo) {
        return {
          expiresIn: 0,
          expiresAt: null,
          isExpired: true,
          daysUntilExpiry: 0,
        };
      }

      const now = new Date();
      const expiresAt = certInfo.validTo;
      const expiresIn = expiresAt.getTime() - now.getTime();
      const daysUntilExpiry = expiresIn / (1000 * 60 * 60 * 24);
      const isExpired = expiresIn < 0;

      return {
        expiresIn,
        expiresAt,
        isExpired,
        daysUntilExpiry: Math.round(daysUntilExpiry),
      };
    } catch (error) {
      this.logger.error('Error getting certificate expiration info', error);
      return {
        expiresIn: 0,
        expiresAt: null,
        isExpired: true,
        daysUntilExpiry: 0,
      };
    }
  }

  /**
   * Check if certificate needs renewal
   */
  async needsRenewal(warningDays: number = 30): Promise<boolean> {
    const info = await this.getCertificateExpirationInfo();
    return (
      info.isExpired ||
      (info.daysUntilExpiry > 0 && info.daysUntilExpiry <= warningDays)
    );
  }

  /**
   * Get certificate health status
   */
  async getCertificateHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    message: string;
    expiresIn: number;
  }> {
    const expirationInfo = await this.getCertificateExpirationInfo();

    if (expirationInfo.isExpired) {
      return {
        status: 'error',
        message: 'El certificado ha expirado. Se requiere renovación inmediata.',
        expiresIn: 0,
      };
    }

    if (expirationInfo.daysUntilExpiry <= 7) {
      return {
        status: 'error',
        message: `El certificado expira en ${expirationInfo.daysUntilExpiry} días. Renovación urgente requerida.`,
        expiresIn: expirationInfo.daysUntilExpiry,
      };
    }

    if (expirationInfo.daysUntilExpiry <= 30) {
      return {
        status: 'warning',
        message: `El certificado expira en ${expirationInfo.daysUntilExpiry} días. Se recomienda renovar pronto.`,
        expiresIn: expirationInfo.daysUntilExpiry,
      };
    }

    return {
      status: 'healthy',
      message: `El certificado es válido. Expira en ${expirationInfo.daysUntilExpiry} días.`,
      expiresIn: expirationInfo.daysUntilExpiry,
    };
  }
}
