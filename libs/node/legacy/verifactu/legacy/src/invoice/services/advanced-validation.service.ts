import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CreateInvoiceDto } from '../../dto/create-invoice.dto';
import { InvoiceRepository } from '../../../database/services/invoice.repository';
import { InvoiceStatus } from '../../dto/tipo-factura.enum';

/**
 * Advanced Validation Service
 * Servicio de validaciones avanzadas con prevención de errores
 */
@Injectable()
export class AdvancedValidationService {
  private readonly logger = new Logger(AdvancedValidationService.name);

  constructor(private invoiceRepository: InvoiceRepository) {}

  /**
   * Comprehensive validation with business rules
   */
  async validateWithBusinessRules(invoice: CreateInvoiceDto): Promise<{
    valid: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const result = {
      valid: true,
      warnings: [] as string[],
      errors: [] as string[],
    };

    // Validate business rules
    await this.validateBusinessRules(invoice, result);
    
    // Validate AEAT compliance
    this.validateAeatCompliance(invoice, result);
    
    // Validate data integrity
    this.validateDataIntegrity(invoice, result);
    
    // Check for potential issues
    await this.checkPotentialIssues(invoice, result);

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(
    invoice: CreateInvoiceDto,
    result: { valid: boolean; warnings: string[]; errors: string[] },
  ): Promise<void> {
    // Check for suspicious amounts
    const totalAmount = invoice.totalAmount || this.calculateTotal(invoice);
    if (totalAmount > 1000000) {
      result.warnings.push(
        'El importe total es muy elevado. Verifique que es correcto.',
      );
    }

    if (totalAmount < 0.01) {
      result.errors.push('El importe total debe ser mayor a 0.01€');
    }

    // Check for unusual tax rates
    const unusualRates = invoice.taxItems.filter(
      (item) => item.taxRate > 0 && (item.taxRate < 4 || item.taxRate > 27),
    );
    if (unusualRates.length > 0) {
      result.warnings.push(
        'Se detectaron tipos impositivos fuera del rango habitual (4%-27%)',
      );
    }

    // Check for multiple tax rates (common but worth noting)
    const uniqueRates = new Set(invoice.taxItems.map((item) => item.taxRate));
    if (uniqueRates.size > 3) {
      result.warnings.push(
        'La factura contiene más de 3 tipos impositivos diferentes',
      );
    }

    // Validate invoice number sequence (if applicable)
    await this.validateInvoiceSequence(invoice, result);
  }

  /**
   * Validate AEAT compliance
   */
  private validateAeatCompliance(
    invoice: CreateInvoiceDto,
    result: { valid: boolean; warnings: string[]; errors: string[] },
  ): void {
    // F1 invoices require buyer information
    if (invoice.invoiceType === 'F1') {
      if (!invoice.buyerID || !invoice.buyerName) {
        result.errors.push(
          'Las facturas tipo F1 requieren NIF y nombre del comprador',
        );
      }
    }

    // F2 invoices (simplified) should not have buyer NIF
    if (invoice.invoiceType === 'F2') {
      if (invoice.buyerID && invoice.buyerIDType !== 'O') {
        result.warnings.push(
          'Las facturas simplificadas (F2) normalmente no incluyen NIF del comprador',
        );
      }
    }

    // Validate description length
    if (invoice.text && invoice.text.length > 500) {
      result.errors.push(
        'La descripción no puede exceder 500 caracteres según normativa AEAT',
      );
    }

    // Check for required fields based on invoice type
    if (invoice.invoiceType === 'F3' || invoice.rectificationType) {
      if (!invoice.originalInvoiceNumber || !invoice.originalInvoiceDate) {
        result.errors.push(
          'Las facturas rectificativas requieren número y fecha de la factura original',
        );
      }
    }
  }

  /**
   * Validate data integrity
   */
  private validateDataIntegrity(
    invoice: CreateInvoiceDto,
    result: { valid: boolean; warnings: string[]; errors: string[] },
  ): void {
    // Check for negative amounts
    const negativeBase = invoice.taxItems.some((item) => item.taxBase < 0);
    const negativeTax = invoice.taxItems.some((item) => item.taxAmount < 0);

    if (negativeBase) {
      result.errors.push('No se permiten bases imponibles negativas');
    }
    if (negativeTax) {
      result.errors.push('No se permiten importes de impuesto negativos');
    }

    // Validate tax calculations
    invoice.taxItems.forEach((item, index) => {
      if (item.taxRate > 0) {
        const expectedTax = (item.taxBase * item.taxRate) / 100;
        const tolerance = 0.01;
        const difference = Math.abs(item.taxAmount - expectedTax);

        if (difference > tolerance) {
          result.errors.push(
            `Error de cálculo en item ${index + 1}: El impuesto calculado (${item.taxAmount.toFixed(2)}) no coincide con el esperado (${expectedTax.toFixed(2)})`,
          );
        }
      }
    });

    // Check total amount consistency
    const calculatedTotal = this.calculateTotal(invoice);
    if (invoice.totalAmount !== undefined) {
      const tolerance = 0.01;
      const difference = Math.abs(invoice.totalAmount - calculatedTotal);

      if (difference > tolerance) {
        result.errors.push(
          `El importe total declarado (${invoice.totalAmount}) no coincide con la suma calculada (${calculatedTotal.toFixed(2)})`,
        );
      }
    }
  }

  /**
   * Check for potential issues
   */
  private async checkPotentialIssues(
    invoice: CreateInvoiceDto,
    result: { valid: boolean; warnings: string[]; errors: string[] },
  ): Promise<void> {
    // Check for duplicate invoice numbers in recent period
    const recentDuplicate = await this.checkRecentDuplicates(invoice);
    if (recentDuplicate) {
      result.warnings.push(
        'Se encontró una factura similar recientemente. Verifique que no sea un duplicado.',
      );
    }

    // Check for rapid succession of invoices (potential error)
    const rapidSuccession = await this.checkRapidSuccession(invoice);
    if (rapidSuccession) {
      result.warnings.push(
        'Se detectaron múltiples facturas en un período muy corto. Verifique que sea correcto.',
      );
    }

    // Check for unusual date patterns
    const invoiceDate = new Date(invoice.invoiceDate);
    const today = new Date();
    const daysDifference = Math.floor(
      (today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDifference > 365) {
      result.warnings.push(
        'La fecha de factura es de hace más de un año. Verifique que sea correcta.',
      );
    }

    if (daysDifference < -30) {
      result.warnings.push(
        'La fecha de factura es de más de 30 días en el futuro. Verifique que sea correcta.',
      );
    }
  }

  /**
   * Validate invoice number sequence
   */
  private async validateInvoiceSequence(
    invoice: CreateInvoiceDto,
    result: { valid: boolean; warnings: string[]; errors: string[] },
  ): Promise<void> {
    // Extract series and number from invoice number
    const match = invoice.invoiceNumber.match(/^([A-Z]+-?[A-Z]*)-?(\d+)$/i);
    if (match) {
      const series = match[1];
      const number = parseInt(match[2], 10);

      // Check for gaps in sequence (potential missing invoices)
      const recentInvoices = await this.invoiceRepository.findAll(
        1,
        10,
        { sellerNif: invoice.sellerID },
        'invoiceNumber',
        'desc',
      );

      const sameSeries = recentInvoices.invoices
        .filter((inv) => inv.invoiceNumber.startsWith(series))
        .map((inv) => {
          const numMatch = inv.invoiceNumber.match(/\d+$/);
          return numMatch ? parseInt(numMatch[0], 10) : 0;
        })
        .filter((n) => n > 0 && n < number);

      if (sameSeries.length > 0) {
        const maxRecent = Math.max(...sameSeries);
        if (number - maxRecent > 10) {
          result.warnings.push(
            `Hay un salto significativo en la numeración (${maxRecent} -> ${number}). Verifique que no falten facturas.`,
          );
        }
      }
    }
  }

  /**
   * Check for recent duplicates
   */
  private async checkRecentDuplicates(
    invoice: CreateInvoiceDto,
  ): Promise<boolean> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInvoices = await this.invoiceRepository.findAll(
      1,
      50,
      {
        sellerNif: invoice.sellerID,
        startDate: thirtyDaysAgo,
      },
      'createdAt',
      'desc',
    );

    return recentInvoices.invoices.some(
      (inv) =>
        inv.invoiceNumber === invoice.invoiceNumber ||
        (inv.totalAmount === invoice.totalAmount &&
          inv.buyerNif === invoice.buyerID &&
          Math.abs(
            new Date(inv.issueDate).getTime() -
              new Date(invoice.invoiceDate).getTime(),
          ) <
            86400000), // Same day
    );
  }

  /**
   * Check for rapid succession
   */
  private async checkRapidSuccession(
    invoice: CreateInvoiceDto,
  ): Promise<boolean> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentInvoices = await this.invoiceRepository.findAll(
      1,
      10,
      {
        sellerNif: invoice.sellerID,
        startDate: oneHourAgo,
      },
      'createdAt',
      'desc',
    );

    return recentInvoices.invoices.length > 5;
  }

  /**
   * Calculate total from tax items
   */
  private calculateTotal(invoice: CreateInvoiceDto): number {
    return invoice.taxItems.reduce(
      (sum, item) => sum + item.taxBase + item.taxAmount,
      0,
    );
  }

  /**
   * Validate NIF format with checksum (Spanish NIF validation)
   */
  validateNIFWithChecksum(nif: string): boolean {
    if (!nif || nif.length !== 9) {
      return false;
    }

    const nifRegex = /^[0-9]{8}[A-Z]$/i;
    if (!nifRegex.test(nif)) {
      return false;
    }

    const numbers = nif.substring(0, 8);
    const letter = nif.substring(8, 9).toUpperCase();
    const letterMap = 'TRWAGMYFPDXBNJZSQVHLCKE';

    const remainder = parseInt(numbers, 10) % 23;
    const expectedLetter = letterMap[remainder];

    return letter === expectedLetter;
  }

  /**
   * Validate CIF format (Spanish company identifier)
   */
  validateCIF(cif: string): boolean {
    if (!cif || cif.length !== 9) {
      return false;
    }

    const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;
    if (!cifRegex.test(cif)) {
      return false;
    }

    // Basic CIF validation (simplified)
    const firstChar = cif[0].toUpperCase();
    const validFirstChars = 'ABCDEFGHJNPQRSUVW';
    return validFirstChars.includes(firstChar);
  }
}
