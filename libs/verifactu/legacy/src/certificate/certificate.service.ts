import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';
import { VeriFactuConfig } from '../config/verifactu.config';

/**
 * Certificate information interface
 */
export interface CertificateInfo {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  thumbprint: string;
  nif: string;
  companyName: string;
}

/**
 * Certificate Service - Handles certificate loading and management
 * Servicio de Certificados - Gestiona la carga y administración de certificados
 */
@Injectable()
export class CertificateService implements OnModuleInit {
  private readonly logger = new Logger(CertificateService.name);
  private certificate: forge.pki.Certificate | null = null;
  private privateKey: forge.pki.rsa.PrivateKey | null = null;
  private certificatePem: string | null = null;
  private privateKeyPem: string | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.loadCertificate();
  }

  /**
   * Load certificate from file or Windows store
   * Cargar certificado desde archivo o almacén de Windows
   */
  async loadCertificate(): Promise<void> {
    const certificatePath =
      this.configService.get<string>('verifactu.certificatePath') || '';
    const certificatePassword =
      this.configService.get<string>('verifactu.certificatePassword') || '';
    const certificateSerial = this.configService.get<string>(
      'verifactu.certificateSerial',
    );
    const certificateThumbprint = this.configService.get<string>(
      'verifactu.certificateThumbprint',
    );

    if (certificatePath && fs.existsSync(certificatePath)) {
      await this.loadCertificateFromFile(certificatePath, certificatePassword);
    } else if (certificateSerial || certificateThumbprint) {
      await this.loadCertificateFromWindowsStore(
        certificateSerial,
        certificateThumbprint,
      );
    } else {
      this.logger.warn(
        'No certificate configuration found. Please configure certificate path or Windows store credentials.',
      );
    }
  }

  /**
   * Load certificate from PFX/P12 file
   * Cargar certificado desde archivo PFX/P12
   */
  private async loadCertificateFromFile(
    filePath: string,
    password: string,
  ): Promise<void> {
    try {
      const pfxData = fs.readFileSync(filePath);
      const pfxAsn1 = forge.asn1.fromDer(pfxData.toString('binary'));
      const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

      // Extract certificate and private key
      const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
      const keyBags = pfx.getBags({
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
      });

      const certBag = certBags[forge.pki.oids.certBag];
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

      if (certBag && certBag.length > 0) {
        this.certificate = certBag[0].cert || null;
        this.certificatePem = forge.pki.certificateToPem(this.certificate!);
      }

      if (keyBag && keyBag.length > 0) {
        this.privateKey = keyBag[0].key as forge.pki.rsa.PrivateKey;
        this.privateKeyPem = forge.pki.privateKeyToPem(this.privateKey);
      }

      this.logger.log(`Certificate loaded successfully from file: ${filePath}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to load certificate from file: ${err.message}`);
      throw error;
    }
  }

  /**
   * Load certificate from Windows certificate store
   * Cargar certificado desde el almacén de certificados de Windows
   * Note: This requires platform-specific implementation or external tools
   */
  private async loadCertificateFromWindowsStore(
    serial?: string,
    thumbprint?: string,
  ): Promise<void> {
    // On Windows, we can use PowerShell to export the certificate
    // This is a workaround since Node.js doesn't have direct access to Windows cert store
    if (process.platform !== 'win32') {
      throw new Error(
        'Windows certificate store is only available on Windows platform',
      );
    }

    try {
      // Use PowerShell to export certificate with private key
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);

      const tempPath = path.join(
        process.env.TEMP || '/tmp',
        'verifactu_cert_temp.pfx',
      );
      const searchCriteria = thumbprint
        ? `Thumbprint -eq '${thumbprint}'`
        : `SerialNumber -eq '${serial}'`;

      const psCommand = `
        $cert = Get-ChildItem -Path Cert:\\CurrentUser\\My | Where-Object { $_.${searchCriteria.split(' ')[0]} ${searchCriteria.split(' ').slice(1).join(' ')} }
        if ($cert) {
          $pwd = ConvertTo-SecureString -String 'temp' -Force -AsPlainText
          Export-PfxCertificate -Cert $cert -FilePath '${tempPath}' -Password $pwd
        }
      `;

      await execPromise(
        `powershell -Command "${psCommand.replace(/\n/g, ' ')}"`,
      );

      // Load the exported certificate
      await this.loadCertificateFromFile(tempPath, 'temp');

      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      this.logger.log('Certificate loaded successfully from Windows store');
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to load certificate from Windows store: ${err.message}`,
      );
      throw error;
    }
  }

  /**
   * Get certificate information
   * Obtener información del certificado
   */
  getCertificateInfo(): CertificateInfo | null {
    if (!this.certificate) {
      return null;
    }

    const subject = this.certificate.subject.attributes
      .map((attr: any) => `${attr.shortName}=${attr.value}`)
      .join(', ');

    const issuer = this.certificate.issuer.attributes
      .map((attr: any) => `${attr.shortName}=${attr.value}`)
      .join(', ');

    // Extract NIF from subject (Spanish NIF format)
    const nifAttr = this.certificate.subject.attributes.find(
      (attr: any) => attr.shortName === 'CN' || attr.shortName === 'OU',
    );
    const nifValue = typeof nifAttr?.value === 'string' ? nifAttr.value : '';
    const nifMatch = nifValue.match(/[A-Za-z0-9]{9}/);
    const nif = nifMatch ? nifMatch[0] : '';

    // Extract company name
    const cnAttr = this.certificate.subject.attributes.find(
      (attr: any) => attr.shortName === 'CN',
    );
    const companyName = typeof cnAttr?.value === 'string' ? cnAttr.value : '';

    return {
      subject,
      issuer,
      serialNumber: this.certificate.serialNumber,
      validFrom: this.certificate.validity.notBefore,
      validTo: this.certificate.validity.notAfter,
      thumbprint: this.calculateThumbprint(),
      nif,
      companyName,
    };
  }

  /**
   * Calculate certificate thumbprint (SHA-1 hash)
   * Calcular huella digital del certificado (hash SHA-1)
   */
  private calculateThumbprint(): string {
    if (!this.certificatePem) {
      return '';
    }

    const md = forge.md.sha1.create();
    md.update(this.certificatePem);
    return md.digest().toHex().toUpperCase();
  }

  /**
   * Sign data with the certificate's private key
   * Firmar datos con la clave privada del certificado
   */
  signData(data: string): string {
    if (!this.privateKey) {
      throw new Error('Private key not loaded');
    }

    const md = forge.md.sha256.create();
    md.update(data, 'utf8');

    const signature = this.privateKey.sign(md);
    return forge.util.encode64(signature);
  }

  /**
   * Sign XML document
   * Firmar documento XML
   */
  signXml(xml: string): string {
    if (!this.certificatePem || !this.privateKeyPem) {
      throw new Error('Certificate or private key not loaded');
    }

    // For XML signing, we'll use xml-crypto library
    // This is a simplified version - full implementation would use xml-crypto
    const SignedXml = require('xml-crypto').SignedXml;

    const sig = new SignedXml();
    sig.addReference("//*[local-name(.)='RegistroAlta']");
    sig.signingKey = this.privateKeyPem;
    sig.keyInfoProvider = {
      getKeyInfo: () =>
        `<X509Data><X509Certificate>${this.certificatePem!.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, '')}</X509Certificate></X509Data>`,
    };

    sig.computeSignature(xml);
    return sig.getSignedXml();
  }

  /**
   * Check if certificate is loaded
   * Verificar si el certificado está cargado
   */
  isCertificateLoaded(): boolean {
    return this.certificate !== null && this.privateKey !== null;
  }

  /**
   * Get certificate PEM
   * Obtener certificado en formato PEM
   */
  getCertificatePem(): string | null {
    return this.certificatePem;
  }

  /**
   * Get private key PEM
   * Obtener clave privada en formato PEM
   */
  getPrivateKeyPem(): string | null {
    return this.privateKeyPem;
  }
}
