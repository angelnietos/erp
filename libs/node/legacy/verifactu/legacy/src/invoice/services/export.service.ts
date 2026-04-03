import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { InvoiceRepository } from '../../../database/services/invoice.repository';
import { InvoiceDocument } from '../../../database/schemas/invoice.schema';

/**
 * Export Service for Invoices
 * Servicio de exportación de facturas
 */
@Injectable()
export class InvoiceExportService {
  private readonly logger = new Logger(InvoiceExportService.name);

  constructor(private invoiceRepository: InvoiceRepository) {}

  /**
   * Export invoices to CSV
   */
  async exportToCSV(
    invoices: InvoiceDocument[],
    res: Response,
    filename: string = 'facturas',
  ): Promise<void> {
    const headers = [
      'Número Factura',
      'Fecha',
      'Tipo',
      'Vendedor NIF',
      'Vendedor Nombre',
      'Comprador NIF',
      'Comprador Nombre',
      'Base Imponible',
      'IVA',
      'Total',
      'Estado',
      'Fecha Envío',
      'CSV AEAT',
      'Hash',
    ];

    const csvRows: string[] = [];
    csvRows.push(headers.join(','));

    invoices.forEach((invoice) => {
      const base = this.calculateBase(invoice);
      const tax = this.calculateTax(invoice);

      const row = [
        this.escapeCSV(invoice.invoiceNumber),
        this.formatDate(invoice.issueDate),
        this.escapeCSV(invoice.invoiceType || ''),
        this.escapeCSV(invoice.sellerNif),
        this.escapeCSV(invoice.sellerName || ''),
        this.escapeCSV(invoice.buyerNif || ''),
        this.escapeCSV(invoice.buyerName || ''),
        this.formatNumber(base),
        this.formatNumber(tax),
        this.formatNumber(invoice.totalAmount || 0),
        this.escapeCSV(invoice.status),
        this.formatDate(invoice.sentAt),
        this.escapeCSV(invoice.aeatCsv || ''),
        this.escapeCSV(invoice.hash || ''),
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const timestamp = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}_${timestamp}.csv"`,
    );
    res.send('\uFEFF' + csvContent); // BOM for Excel compatibility
  }

  /**
   * Export invoices to JSON
   */
  async exportToJSON(
    invoices: InvoiceDocument[],
    res: Response,
    filename: string = 'facturas',
  ): Promise<void> {
    const data = invoices.map((invoice) => ({
      numeroFactura: invoice.invoiceNumber,
      fecha: invoice.issueDate,
      tipo: invoice.invoiceType,
      vendedor: {
        nif: invoice.sellerNif,
        nombre: invoice.sellerName,
      },
      comprador: {
        nif: invoice.buyerNif,
        nombre: invoice.buyerName,
      },
      importes: {
        base: this.calculateBase(invoice),
        iva: this.calculateTax(invoice),
        total: invoice.totalAmount,
      },
      estado: invoice.status,
      fechaEnvio: invoice.sentAt,
      csvAeat: invoice.aeatCsv,
      hash: invoice.hash,
      items: invoice.taxItems,
    }));

    const timestamp = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}_${timestamp}.json"`,
    );
    res.json({
      metadata: {
        exportDate: new Date().toISOString(),
        totalInvoices: invoices.length,
        version: '1.0',
      },
      invoices: data,
    });
  }

  /**
   * Calculate base amount
   */
  private calculateBase(invoice: InvoiceDocument): number {
    if (invoice.taxItems && invoice.taxItems.length > 0) {
      return invoice.taxItems.reduce(
        (sum, item) => sum + (item.baseImponible || 0),
        0,
      );
    }
    return invoice.totalAmount || 0;
  }

  /**
   * Calculate tax amount
   */
  private calculateTax(invoice: InvoiceDocument): number {
    if (invoice.taxItems && invoice.taxItems.length > 0) {
      return invoice.taxItems.reduce(
        (sum, item) => sum + (item.cuota || 0),
        0,
      );
    }
    return 0;
  }

  /**
   * Format date
   */
  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  /**
   * Format number
   */
  private formatNumber(num: number): string {
    return num.toFixed(2).replace('.', ',');
  }

  /**
   * Escape CSV value
   */
  private escapeCSV(value: string | undefined): string {
    if (!value) return '';
    const stringValue = String(value);
    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }
}
