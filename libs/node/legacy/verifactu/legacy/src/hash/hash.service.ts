import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Hash Service - Generates fingerprints/hashes for invoice records
 * Servicio de Hash - Genera huellas digitales para registros de facturas
 */
@Injectable()
export class HashService {
  private readonly logger = new Logger(HashService.name);

  /**
   * Generate SHA-256 hash of the input data
   * Generar hash SHA-256 de los datos de entrada
   */
  generateSha256Hash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data, 'utf8')
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Generate hash for RegistroAlta (invoice registration record)
   * Generar huella para RegistroAlta (registro de alta de factura)
   *
   * According to AEAT specifications (v1.2.0), the data is concatenated using
   * the format: fieldName1=value1&fieldName2=value2&...
   *
   * Fields for Alta:
   * 1. IDEmisorFactura
   * 2. NumSerieFactura
   * 3. FechaExpedicionFactura (DD-MM-YYYY)
   * 4. TipoFactura
   * 5. CuotaTotal (Two decimals, '.' separator)
   * 6. ImporteTotal (Two decimals, '.' separator)
   * 7. Huella (Previous record hash, empty if first)
   * 8. FechaHoraHusoGenRegistro (ISO 8601 with timezone)
   */
  generateRegistroAltaHash(params: {
    sellerNif: string;
    invoiceNumber: string;
    invoiceDate: string; // Should be DD-MM-YYYY
    invoiceType: string;
    cuotaTotal: number;
    totalAmount: number;
    previousHash: string; // Hash anterior (vacío si es el primero)
    timestamp: string; // FechaHoraHusoGenRegistro
  }): string {
    // If it's the initial hash (64 zeros), it must be empty in the concatenation
    const huellaAnterior =
      params.previousHash === this.generateInitialHash() || !params.previousHash
        ? ''
        : params.previousHash;

    const dataToHash = [
      `IDEmisorFactura=${params.sellerNif}`,
      `NumSerieFactura=${params.invoiceNumber}`,
      `FechaExpedicionFactura=${params.invoiceDate}`,
      `TipoFactura=${params.invoiceType}`,
      `CuotaTotal=${params.cuotaTotal.toFixed(2)}`,
      `ImporteTotal=${params.totalAmount.toFixed(2)}`,
      `Huella=${huellaAnterior}`,
      `FechaHoraHusoGenRegistro=${params.timestamp}`,
    ].join('&');

    return this.generateSha256Hash(dataToHash);
  }

  /**
   * Generate hash for RegistroAnulacion (invoice cancellation record)
   * Generar huella para RegistroAnulacion (registro de anulación de factura)
   *
   * According to AEAT specifications (v1.2.0), the data is concatenated using
   * the format: fieldName1=value1&fieldName2=value2&...
   *
   * Fields for Anulacion:
   * 1. IDEmisorFacturaAnulada
   * 2. NumSerieFacturaAnulada
   * 3. FechaExpedicionFacturaAnulada (DD-MM-YYYY)
   * 4. Huella (Previous record hash)
   * 5. FechaHoraHusoGenRegistro (ISO 8601 with timezone)
   */
  generateRegistroAnulacionHash(params: {
    sellerNif: string;
    invoiceNumber: string;
    invoiceDate: string; // Should be DD-MM-YYYY
    previousHash: string;
    timestamp: string;
  }): string {
    const dataToHash = [
      `IDEmisorFacturaAnulada=${params.sellerNif}`,
      `NumSerieFacturaAnulada=${params.invoiceNumber}`,
      `FechaExpedicionFacturaAnulada=${params.invoiceDate}`,
      `Huella=${params.previousHash}`,
      `FechaHoraHusoGenRegistro=${params.timestamp}`,
    ].join('&');

    return this.generateSha256Hash(dataToHash);
  }

  /**
   * Generate initial hash for blockchain start
   * Generar hash inicial para inicio de cadena de bloques
   */
  generateInitialHash(): string {
    // Initial hash is a fixed string as per AEAT specifications
    return '0000000000000000000000000000000000000000000000000000000000000000';
  }

  /**
   * Generate timestamp in ISO 8601 format with timezone
   * Generar marca de tiempo en formato ISO 8601 con zona horaria
   */
  generateTimestamp(date?: Date): string {
    const d = date || new Date();
    // Format: 2024-01-01T19:20:30+01:00
    const isoString = d.toISOString();
    const offset = -d.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60)
      .toString()
      .padStart(2, '0');
    const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
    const offsetSign = offset >= 0 ? '+' : '-';

    return (
      isoString.replace('Z', '') +
      offsetSign +
      offsetHours +
      ':' +
      offsetMinutes
    );
  }

  /**
   * Generate timestamp in UTC format for AEAT
   * Generar marca de tiempo en formato UTC para la AEAT
   */
  generateTimestampUtc(date?: Date): string {
    const d = date || new Date();
    return d.toISOString();
  }

  /**
   * Generate hash for XML signature
   * Generar hash para firma XML
   */
  generateXmlSignatureHash(xmlContent: string): string {
    // Remove whitespace and normalize XML
    const normalizedXml = xmlContent
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();

    return this.generateSha256Hash(normalizedXml);
  }

  /**
   * Verify hash integrity
   * Verificar integridad del hash
   */
  verifyHash(data: string, expectedHash: string): boolean {
    const calculatedHash = this.generateSha256Hash(data);
    return calculatedHash === expectedHash.toUpperCase();
  }

  /**
   * Generate QR code URL for invoice validation
   * Generar URL del código QR para validación de factura
   */
  generateQrValidationUrl(params: {
    nif: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    environment: 'test' | 'production';
  }): string {
    const baseUrl =
      params.environment === 'production'
        ? 'https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR'
        : 'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR';

    const formattedDate = this.formatDateForHash(params.invoiceDate);

    // Using explicit string concatenation to ensure specific order and encoding
    const query = [
      `nif=${encodeURIComponent(params.nif)}`,
      `numserie=${encodeURIComponent(params.invoiceNumber)}`,
      `fecha=${encodeURIComponent(formattedDate)}`,
      `importe=${encodeURIComponent(params.totalAmount.toFixed(2))}`,
    ].join('&');

    return `${baseUrl}?${query}`;
  }

  /**
   * Format date for hashing (DD-MM-YYYY)
   * Formatear fecha para el cálculo de la huella
   */
  formatDateForHash(date: string): string {
    if (!date) return '';
    // If already in DD-MM-YYYY format, return as is
    if (date.includes('-') && date.split('-')[0].length === 2) {
      return date;
    }
    // Convert from YYYY-MM-DD or ISO string to DD-MM-YYYY
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Calculate total tax amount (CuotaTotal) from tax items
   * Calcular cuota total de impuestos de las líneas
   */
  calculateCuotaTotal(
    taxItems: Array<{
      taxAmount: number;
      equivalenceSurchargeAmount?: number;
    }>,
  ): number {
    return taxItems.reduce((total, item) => {
      return total + item.taxAmount + (item.equivalenceSurchargeAmount || 0);
    }, 0);
  }

  /**
   * Calculate total amount from tax items
   * Calcular importe total de las líneas de impuestos
   */
  calculateTotalAmount(
    taxItems: Array<{
      taxBase: number;
      taxAmount: number;
      equivalenceSurchargeAmount?: number;
    }>,
  ): number {
    return taxItems.reduce((total, item) => {
      return (
        total +
        item.taxBase +
        item.taxAmount +
        (item.equivalenceSurchargeAmount || 0)
      );
    }, 0);
  }
}
