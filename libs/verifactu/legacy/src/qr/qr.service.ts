import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { HashService } from '../hash/hash.service';

/**
 * QR Service - Generates QR codes for invoice validation
 * Servicio QR - Genera códigos QR para validación de facturas
 */
@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  constructor(
    private configService: ConfigService,
    private hashService: HashService,
  ) {}

  /**
   * Generate QR code URL for invoice validation
   * Generar URL del código QR para validación de factura
   */
  generateQrUrl(params: {
    nif: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
  }): string {
    const environment =
      this.configService.get<string>('verifactu.aeatEnvironment') || 'test';

    return this.hashService.generateQrValidationUrl({
      ...params,
      environment: environment as 'test' | 'production',
    });
  }

  /**
   * Generate QR code as base64 image
   * Generar código QR como imagen base64
   */
  async generateQrBase64(params: {
    nif: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
  }): Promise<string> {
    const url = this.generateQrUrl(params);

    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      // Extract base64 data from data URL
      const base64Data = qrDataUrl.split(',')[1];
      return base64Data;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to generate QR code: ${err.message}`);
      throw error;
    }
  }

  /**
   * Generate QR code as Buffer
   * Generar código QR como Buffer
   */
  async generateQrBuffer(params: {
    nif: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
  }): Promise<Buffer> {
    const url = this.generateQrUrl(params);

    try {
      const qrBuffer = await QRCode.toBuffer(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return qrBuffer;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to generate QR code buffer: ${err.message}`);
      throw error;
    }
  }

  /**
   * Generate QR code as data URL
   * Generar código QR como URL de datos
   */
  async generateQrDataUrl(params: {
    nif: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
  }): Promise<string> {
    const url = this.generateQrUrl(params);

    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return qrDataUrl;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to generate QR data URL: ${err.message}`);
      throw error;
    }
  }

  /**
   * Generate QR code as SVG string
   * Generar código QR como cadena SVG
   */
  async generateQrSvg(params: {
    nif: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
  }): Promise<string> {
    const url = this.generateQrUrl(params);

    try {
      const qrSvg = await QRCode.toString(url, {
        type: 'svg',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return qrSvg;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to generate QR SVG: ${err.message}`);
      throw error;
    }
  }
}
