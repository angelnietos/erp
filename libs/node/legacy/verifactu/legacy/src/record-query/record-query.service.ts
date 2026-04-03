import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AeatSoapService } from '../aeat/aeat-soap.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../../database/schemas/invoice.schema';

/**
 * Record Query Service
 * Servicio para consulta de registros de facturación según Orden HAC/1177/2024
 * 
 * Permite consultar registros enviados a la AEAT a través de la Sede Electrónica
 * Referencia: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html
 */
@Injectable()
export class RecordQueryService {
  private readonly logger = new Logger(RecordQueryService.name);

  constructor(
    private configService: ConfigService,
    private aeatSoapService: AeatSoapService,
    @InjectModel(Invoice.name)
    private invoiceModel: Model<InvoiceDocument>,
  ) {}

  /**
   * Consultar registros de facturación enviados
   * Operación: ConsultaFactuSistemaFacturacion según WSDL AEAT
   * Referencia: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html
   */
  async queryRecords(filters: {
    nif?: string;
    startDate?: Date;
    endDate?: Date;
    invoiceNumber?: string;
    status?: string;
  }): Promise<any> {
    try {
      // Primero buscar en base de datos local
      const localRecords = await this.queryLocalRecords(filters);

      // Si se requiere consulta en AEAT, hacer llamada SOAP
      // Nota: La consulta en AEAT requiere autenticación y certificado válido
      if (filters.invoiceNumber && filters.nif) {
        try {
          // Formatear fecha para consulta AEAT (DD-MM-YYYY)
          const invoiceDate = filters.startDate 
            ? this.formatDateForAeat(filters.startDate)
            : this.formatDateForAeat(new Date());
          
          // Llamar al método de consulta del servicio SOAP
          // El método consultaFactura está definido en aeat-soap.service.ts
          const aeatResponse = await this.aeatSoapService.consultaFactura(
            filters.nif,
            filters.invoiceNumber,
            invoiceDate,
          );
          
          // Combinar resultados locales con respuesta AEAT
          return this.mergeQueryResults(localRecords, aeatResponse);
        } catch (error) {
          this.logger.warn('Error al consultar en AEAT, usando solo registros locales', error);
          return localRecords;
        }
      }

      return localRecords;
    } catch (error) {
      this.logger.error('Error al consultar registros', error);
      throw error;
    }
  }

  /**
   * Consultar registros en base de datos local
   */
  private async queryLocalRecords(filters: any): Promise<any> {
    const query: any = {};

    if (filters.nif) {
      query.sellerID = filters.nif;
    }

    if (filters.startDate || filters.endDate) {
      query.invoiceDate = {};
      if (filters.startDate) {
        query.invoiceDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.invoiceDate.$lte = filters.endDate;
      }
    }

    if (filters.invoiceNumber) {
      query.invoiceNumber = filters.invoiceNumber;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const invoices = await this.invoiceModel.find(query)
      .sort({ invoiceDate: -1 })
      .limit(1000)
      .exec();

    return {
      records: invoices.map(inv => this.mapInvoiceToRecord(inv)),
      total: invoices.length,
      source: 'local',
      queryDate: new Date().toISOString(),
    };
  }

  /**
   * Mapear invoice a formato de registro estándar
   */
  private mapInvoiceToRecord(invoice: any): any {
    return {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      sellerNif: invoice.sellerID,
      sellerName: invoice.sellerName,
      buyerNif: invoice.buyerID,
      buyerName: invoice.buyerName,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      aeatStatus: invoice.aeatStatus,
      csv: invoice.csv,
      sentAt: invoice.sentAt,
      acceptedAt: invoice.acceptedAt,
      hash: invoice.hash,
      blockchainHash: invoice.blockchainHash,
    };
  }

  /**
   * Combinar resultados locales con respuesta AEAT
   */
  private mergeQueryResults(localRecords: any, aeatResponse: any): any {
    // TODO: Implementar lógica de merge
    return {
      ...localRecords,
      aeatResponse,
      merged: true,
    };
  }

  /**
   * Construir XML de consulta según formato AEAT
   */
  private buildQueryXml(filters: any): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ConsultaFactuSistemaFacturacion>
  <Cabecera>
    <NIF>${filters.nif || ''}</NIF>
    <FechaDesde>${filters.startDate ? this.formatDate(filters.startDate) : ''}</FechaDesde>
    <FechaHasta>${filters.endDate ? this.formatDate(filters.endDate) : ''}</FechaHasta>
    ${filters.invoiceNumber ? `<NumeroFactura>${filters.invoiceNumber}</NumeroFactura>` : ''}
  </Cabecera>
</ConsultaFactuSistemaFacturacion>`;

    return xml;
  }

  /**
   * Parsear respuesta de consulta
   */
  private parseQueryResponse(response: any): any {
    // TODO: Parsear XML de respuesta según formato AEAT
    return {
      records: [],
      total: 0,
      queryDate: new Date().toISOString(),
    };
  }

  /**
   * Obtener estado de un registro específico
   */
  async getRecordStatus(invoiceNumber: string, nif: string): Promise<any> {
    const result = await this.queryRecords({
      invoiceNumber,
      nif,
    });

    if (result.records && result.records.length > 0) {
      return result.records[0];
    }

    return null;
  }

  /**
   * Verificar si una factura fue aceptada por la AEAT
   */
  async verifyInvoiceAccepted(invoiceNumber: string, nif: string): Promise<boolean> {
    const record = await this.getRecordStatus(invoiceNumber, nif);
    return record?.status === 'ACCEPTED' || record?.estado === 'Aceptada';
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDateForAeat(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
