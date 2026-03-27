import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Compliance Service
 * Servicio de Cumplimiento Normativo según RD 1007/2023 y Orden HAC/1177/2024
 * 
 * Referencias:
 * - RD 1007/2023: Reglamento de Sistemas Informáticos de Facturación
 * - Orden HAC/1177/2024: Especificaciones técnicas y funcionales
 * - https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html
 */
@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Validar cumplimiento de requisitos SIF según RD 1007/2023
   * Artículo 3: Requisitos de los sistemas informáticos de facturación
   */
  validateSIFCompliance(invoiceData: any): {
    compliant: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validar numeración única y correlativa
    if (!this.validateSequentialNumbering(invoiceData)) {
      errors.push('La numeración de facturas debe ser única y correlativa');
    }

    // 2. Validar integridad e inalterabilidad
    if (!this.validateIntegrity(invoiceData)) {
      errors.push('La factura debe garantizar integridad e inalterabilidad');
    }

    // 3. Validar conservación de registros
    if (!this.validateRecordConservation(invoiceData)) {
      warnings.push('Debe garantizarse la conservación de registros durante 4 años');
    }

    // 4. Validar trazabilidad
    if (!this.validateTraceability(invoiceData)) {
      errors.push('La factura debe garantizar trazabilidad completa');
    }

    // 5. Validar formato estándar según Orden HAC/1177/2024
    if (!this.validateStandardFormat(invoiceData)) {
      errors.push('El formato debe cumplir con las especificaciones de la Orden HAC/1177/2024');
    }

    return {
      compliant: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validar numeración secuencial según Art. 3.1.b) RD 1007/2023
   */
  private validateSequentialNumbering(invoiceData: any): boolean {
    // La numeración debe ser única, correlativa y sin saltos
    // Esta validación se debe hacer a nivel de serie
    return true; // Implementar lógica de validación
  }

  /**
   * Validar integridad e inalterabilidad según Art. 3.1.c) RD 1007/2023
   */
  private validateIntegrity(invoiceData: any): boolean {
    // Debe incluir hash o firma digital
    return !!(invoiceData.hash || invoiceData.digitalSignature);
  }

  /**
   * Validar conservación de registros según Art. 3.1.d) RD 1007/2023
   */
  private validateRecordConservation(invoiceData: any): boolean {
    // Debe garantizarse conservación durante 4 años
    return true; // Implementar verificación de almacenamiento
  }

  /**
   * Validar trazabilidad según Art. 3.1.e) RD 1007/2023
   */
  private validateTraceability(invoiceData: any): boolean {
    // Debe permitir identificar origen, modificaciones y destino
    return !!(invoiceData.traceability && invoiceData.auditTrail);
  }

  /**
   * Validar formato estándar según Orden HAC/1177/2024
   */
  private validateStandardFormat(invoiceData: any): boolean {
    // Validar estructura XML según especificaciones técnicas
    const requiredFields = [
      'invoiceNumber',
      'invoiceDate',
      'sellerNif',
      'buyerNif',
      'totalAmount',
      'taxBase',
      'taxAmount',
    ];

    return requiredFields.every(field => invoiceData[field] !== undefined);
  }

  /**
   * Generar registro de facturación según formato estándar AEAT
   * Orden HAC/1177/2024 - Anexo I
   */
  generateStandardRecord(invoiceData: any): any {
    return {
      // Identificación del registro
      TipoRegistro: 'F1', // Factura completa
      NumeroFactura: invoiceData.invoiceNumber,
      FechaExpedicion: this.formatDate(invoiceData.invoiceDate),
      
      // Identificación del emisor
      NIFEmisor: invoiceData.sellerNif,
      NombreEmisor: invoiceData.sellerName,
      
      // Identificación del destinatario
      NIFDestinatario: invoiceData.buyerNif,
      NombreDestinatario: invoiceData.buyerName,
      
      // Importes
      BaseImponible: invoiceData.taxBase,
      TipoIVA: invoiceData.taxRate,
      CuotaIVA: invoiceData.taxAmount,
      ImporteTotal: invoiceData.totalAmount,
      
      // Metadatos de cumplimiento
      Hash: invoiceData.hash,
      FirmaDigital: invoiceData.digitalSignature,
      Timestamp: new Date().toISOString(),
      
      // Trazabilidad
      Origen: 'SISTEMA_FACTURACION',
      VersionSistema: '1.0.0',
    };
  }

  /**
   * Validar certificado según especificaciones AEAT
   */
  validateCertificate(certificate: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validar que el certificado no esté caducado
    if (certificate.expirationDate && new Date(certificate.expirationDate) < new Date()) {
      errors.push('El certificado digital ha caducado');
    }

    // Validar que el certificado sea válido para firma
    if (!certificate.canSign) {
      errors.push('El certificado no permite firma digital');
    }

    // Validar NIF del certificado
    if (!certificate.nif) {
      errors.push('El certificado debe contener el NIF del titular');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generar informe de cumplimiento normativo
   */
  generateComplianceReport(invoices: any[]): any {
    const total = invoices.length;
    const compliant = invoices.filter(inv => 
      this.validateSIFCompliance(inv).compliant
    ).length;

    return {
      totalInvoices: total,
      compliantInvoices: compliant,
      nonCompliantInvoices: total - compliant,
      complianceRate: total > 0 ? (compliant / total) * 100 : 0,
      lastValidation: new Date().toISOString(),
      normativa: {
        rd: 'RD 1007/2023',
        orden: 'Orden HAC/1177/2024',
        version: '1.0',
      },
    };
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }
}
