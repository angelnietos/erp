import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateInvoiceDto } from '../../dto/create-invoice.dto';
import { InvoiceStatus } from '../../dto/tipo-factura.enum';
import { InvoiceRepository } from '../../../database/services/invoice.repository';

/**
 * Invoice Validation Service
 * Servicio de validación de facturas con reglas de negocio avanzadas
 */
@Injectable()
export class InvoiceValidationService {
  constructor(private invoiceRepository: InvoiceRepository) {}

  /**
   * Validate invoice before creation
   */
  async validateInvoice(invoice: CreateInvoiceDto): Promise<void> {
    // Validate invoice number format
    this.validateInvoiceNumber(invoice.invoiceNumber);

    // Validate dates
    this.validateDates(invoice);

    // Validate amounts
    this.validateAmounts(invoice);

    // Validate NIFs
    this.validateNIFs(invoice);

    // Check for duplicates
    await this.checkDuplicate(invoice);

    // Validate rectification if applicable
    if (invoice.rectificationType) {
      await this.validateRectification(invoice);
    }

    // Validate tax items
    this.validateTaxItems(invoice.taxItems);
  }

  /**
   * Validate invoice number format
   */
  private validateInvoiceNumber(invoiceNumber: string): void {
    if (!invoiceNumber || invoiceNumber.trim().length === 0) {
      throw new BadRequestException('El número de factura es obligatorio');
    }

    if (invoiceNumber.length > 60) {
      throw new BadRequestException(
        'El número de factura no puede exceder 60 caracteres',
      );
    }

    // Check for invalid characters
    if (!/^[A-Za-z0-9\-_\/]+$/.test(invoiceNumber)) {
      throw new BadRequestException(
        'El número de factura contiene caracteres inválidos',
      );
    }
  }

  /**
   * Validate dates
   */
  private validateDates(invoice: CreateInvoiceDto): void {
    const invoiceDate = new Date(invoice.invoiceDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Invoice date cannot be more than 1 year in the future
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (invoiceDate > maxDate) {
      throw new BadRequestException(
        'La fecha de factura no puede ser más de 1 año en el futuro',
      );
    }

    // Invoice date cannot be more than 4 years in the past
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 4);

    if (invoiceDate < minDate) {
      throw new BadRequestException(
        'La fecha de factura no puede ser más de 4 años en el pasado',
      );
    }

    // Validate rental dates if present
    if (invoice.rentalStartDate && invoice.rentalEndDate) {
      const startDate = new Date(invoice.rentalStartDate);
      const endDate = new Date(invoice.rentalEndDate);

      if (startDate >= endDate) {
        throw new BadRequestException(
          'La fecha de inicio de alquiler debe ser anterior a la fecha de fin',
        );
      }
    }

    // Validate payment due date
    if (invoice.paymentDueDate) {
      const dueDate = new Date(invoice.paymentDueDate);
      if (dueDate < invoiceDate) {
        throw new BadRequestException(
          'La fecha de vencimiento no puede ser anterior a la fecha de factura',
        );
      }
    }
  }

  /**
   * Validate amounts
   */
  private validateAmounts(invoice: CreateInvoiceDto): void {
    // Calculate total from tax items
    const calculatedTotal = invoice.taxItems.reduce(
      (sum, item) => sum + item.taxBase + item.taxAmount,
      0,
    );

    // If totalAmount is provided, it should match calculated total (with tolerance)
    if (invoice.totalAmount !== undefined) {
      const tolerance = 0.01; // 1 cent tolerance for rounding
      const difference = Math.abs(invoice.totalAmount - calculatedTotal);

      if (difference > tolerance) {
        throw new BadRequestException(
          `El importe total (${invoice.totalAmount}) no coincide con la suma de bases e impuestos (${calculatedTotal.toFixed(2)})`,
        );
      }
    }

    // Validate individual tax items
    invoice.taxItems.forEach((item, index) => {
      if (item.taxBase < 0) {
        throw new BadRequestException(
          `La base imponible del item ${index + 1} no puede ser negativa`,
        );
      }

      if (item.taxAmount < 0) {
        throw new BadRequestException(
          `El importe del impuesto del item ${index + 1} no puede ser negativo`,
        );
      }

      // Validate tax rate
      if (item.taxRate < 0 || item.taxRate > 100) {
        throw new BadRequestException(
          `El tipo impositivo del item ${index + 1} debe estar entre 0 y 100%`,
        );
      }

      // Validate tax calculation (with tolerance)
      if (item.taxRate > 0) {
        const expectedTax = (item.taxBase * item.taxRate) / 100;
        const tolerance = 0.01;
        const difference = Math.abs(item.taxAmount - expectedTax);

        if (difference > tolerance) {
          throw new BadRequestException(
            `El cálculo del impuesto del item ${index + 1} es incorrecto. Esperado: ${expectedTax.toFixed(2)}, Recibido: ${item.taxAmount.toFixed(2)}`,
          );
        }
      }
    });
  }

  /**
   * Validate NIFs
   */
  private validateNIFs(invoice: CreateInvoiceDto): void {
    // Validate seller NIF
    if (!this.isValidNIF(invoice.sellerID)) {
      throw new BadRequestException('El NIF del vendedor no es válido');
    }

    // Validate buyer NIF if provided
    if (invoice.buyerID && invoice.buyerIDType) {
      if (!this.isValidNIF(invoice.buyerID, invoice.buyerIDType)) {
        throw new BadRequestException('El NIF del comprador no es válido');
      }
    }
  }

  /**
   * Check if NIF is valid
   */
  private isValidNIF(nif: string, type?: string): boolean {
    if (!nif || nif.length < 9) {
      return false;
    }

    // Basic format validation
    if (type === 'N' || !type) {
      // Spanish NIF format: 8 digits + 1 letter
      return /^[0-9]{8}[A-Z]$/i.test(nif);
    }

    // For other types, basic length check
    return nif.length >= 9 && nif.length <= 20;
  }

  /**
   * Check for duplicate invoice
   */
  private async checkDuplicate(invoice: CreateInvoiceDto): Promise<void> {
    const existing = await this.invoiceRepository.findByInvoiceNumber(
      invoice.invoiceNumber,
      invoice.sellerID,
    );

    if (existing) {
      // Check if it's cancelled (can be replaced)
      if (existing.status !== InvoiceStatus.ANULADA) {
        throw new BadRequestException(
          `Ya existe una factura con el número ${invoice.invoiceNumber} para el vendedor ${invoice.sellerID}`,
        );
      }
    }
  }

  /**
   * Validate rectification
   */
  private async validateRectification(
    invoice: CreateInvoiceDto,
  ): Promise<void> {
    if (!invoice.originalInvoiceNumber || !invoice.originalInvoiceDate) {
      throw new BadRequestException(
        'Las facturas rectificativas requieren número y fecha de la factura original',
      );
    }

    // Check if original invoice exists
    const original = await this.invoiceRepository.findByInvoiceNumber(
      invoice.originalInvoiceNumber,
      invoice.sellerID,
    );

    if (!original) {
      throw new BadRequestException(
        `No se encontró la factura original ${invoice.originalInvoiceNumber}`,
      );
    }

    // Original invoice must be confirmed
    if (original.status !== InvoiceStatus.CONFIRMADA) {
      throw new BadRequestException(
        'Solo se pueden rectificar facturas confirmadas por la AEAT',
      );
    }

    // Validate rectification reason
    if (!invoice.rectificationReason || invoice.rectificationReason.trim().length === 0) {
      throw new BadRequestException(
        'El motivo de rectificación es obligatorio',
      );
    }
  }

  /**
   * Validate tax items
   */
  private validateTaxItems(taxItems: CreateInvoiceDto['taxItems']): void {
    if (!taxItems || taxItems.length === 0) {
      throw new BadRequestException('La factura debe tener al menos un item de impuesto');
    }

    if (taxItems.length > 50) {
      throw new BadRequestException(
        'La factura no puede tener más de 50 items de impuesto',
      );
    }

    // Check for duplicate tax rates (warn but don't fail)
    const taxRates = taxItems.map((item) => item.taxRate);
    const uniqueRates = new Set(taxRates);
    if (uniqueRates.size < taxRates.length) {
      // This is a warning, not an error - multiple items can have same rate
    }
  }

  /**
   * Validate invoice for cancellation
   */
  async validateCancellation(
    invoiceNumber: string,
    sellerNif: string,
  ): Promise<void> {
    const invoice = await this.invoiceRepository.findByInvoiceNumber(
      invoiceNumber,
      sellerNif,
    );

    if (!invoice) {
      throw new BadRequestException('Factura no encontrada');
    }

    if (invoice.status === InvoiceStatus.ANULADA) {
      throw new BadRequestException('La factura ya está anulada');
    }

    if (invoice.status !== InvoiceStatus.CONFIRMADA) {
      throw new BadRequestException(
        'Solo se pueden anular facturas confirmadas por la AEAT',
      );
    }

    // Check if invoice was sent more than 4 years ago
    const sentDate = invoice.sentAt || invoice.issueDate;
    const fourYearsAgo = new Date();
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

    if (sentDate < fourYearsAgo) {
      throw new BadRequestException(
        'No se pueden anular facturas con más de 4 años de antigüedad',
      );
    }
  }
}
