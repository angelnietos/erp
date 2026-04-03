import { Injectable, Logger } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { CancelInvoiceDto } from '../dto/cancel-invoice.dto';
import { TaxItemDto } from '../dto/tax-item.dto';
import { BlockchainRecord } from '../blockchain/blockchain.service';
import {
  TipoFactura,
  ClaveRegimen,
  CalificacionOperacion,
} from '../dto/tipo-factura.enum';

/**
 * XML Builder Service - Generates XML for AEAT SOAP requests
 * Servicio de construcción XML - Genera XML para solicitudes SOAP de la AEAT
 *
 * Based on official AEAT WSDL and XSD schemas (Version 1.0.3):
 * - https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SistemaFacturacion.wsdl
 * - https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd
 * - https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd
 */
@Injectable()
export class XmlBuilderService {
  private readonly logger = new Logger(XmlBuilderService.name);

  // XML namespaces used in AEAT SOAP requests (production URLs)
  private readonly NS_SOAPENV = 'http://schemas.xmlsoap.org/soap/envelope/';
  private readonly NS_SUMINISTRO_LR =
    'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd';
  private readonly NS_SUMINISTRO_INFO =
    'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd';
  private readonly NS_XMLDSIG = 'http://www.w3.org/2000/09/xmldsig#';

  /**
   * Build complete SOAP envelope for invoice registration (Alta)
   * Construir sobre SOAP completo para registro de factura (Alta)
   */
  buildRegistroAlta(
    invoice: CreateInvoiceDto,
    record: BlockchainRecord,
    systemInfo: SystemInfoType,
    previousInvoice?: PreviousInvoiceInfo,
  ): string {
    const totalAmount =
      invoice.totalAmount || this.calculateTotalAmount(invoice.taxItems);
    const fechaFormatted = this.formatDate(invoice.invoiceDate);

    // Build encadenamiento - for first record use PrimerRegistro, otherwise use RegistroAnterior
    const encadenamientoXml = this.buildEncadenamiento(
      invoice.sellerID,
      previousInvoice,
      record.previousHash,
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="${this.NS_SOAPENV}"
xmlns:sum="${this.NS_SUMINISTRO_LR}"
xmlns:sum1="${this.NS_SUMINISTRO_INFO}"
xmlns:xd="${this.NS_XMLDSIG}">
  <soapenv:Header/>
  <soapenv:Body>
    <sum:RegFactuSistemaFacturacion>
      <sum:Cabecera>
        <sum1:ObligadoEmision>
          <sum1:NombreRazon>${this.escapeXml(invoice.sellerName || '')}</sum1:NombreRazon>
          <sum1:NIF>${invoice.sellerID}</sum1:NIF>
        </sum1:ObligadoEmision>
      </sum:Cabecera>
      <sum:RegistroFactura>
        <sum1:RegistroAlta>
          <sum1:IDVersion>1.0</sum1:IDVersion>
          <sum1:IDFactura>
            <sum1:IDEmisorFactura>${invoice.sellerID}</sum1:IDEmisorFactura>
            <sum1:NumSerieFactura>${this.escapeXml(invoice.invoiceNumber)}</sum1:NumSerieFactura>
            <sum1:FechaExpedicionFactura>${fechaFormatted}</sum1:FechaExpedicionFactura>
          </sum1:IDFactura>
          <sum1:NombreRazonEmisor>${this.escapeXml(invoice.sellerName || '')}</sum1:NombreRazonEmisor>
          ${invoice.subsanacion ? `<sum1:Subsanacion>${invoice.subsanacion}</sum1:Subsanacion>` : ''}
          <sum1:TipoFactura>${invoice.invoiceType || TipoFactura.F1}</sum1:TipoFactura>
          <sum1:DescripcionOperacion>${this.escapeXml(invoice.text || 'Operacion facturada')}</sum1:DescripcionOperacion>
          ${invoice.buyerID ? this.buildDestinatarios(invoice) : ''}
          <sum1:Desglose>
            ${this.buildDetalleDesglose(invoice.taxItems)}
          </sum1:Desglose>
          <sum1:CuotaTotal>${this.formatNumber(this.calculateCuotaTotal(invoice.taxItems))}</sum1:CuotaTotal>
          <sum1:ImporteTotal>${this.formatNumber(totalAmount)}</sum1:ImporteTotal>
          <sum1:Encadenamiento>
            ${encadenamientoXml}
          </sum1:Encadenamiento>
          <sum1:SistemaInformatico>
            <sum1:NombreRazon>${this.escapeXml(systemInfo.nombreRazon)}</sum1:NombreRazon>
            <sum1:NIF>${systemInfo.nif}</sum1:NIF>
            <sum1:NombreSistemaInformatico>${this.escapeXml(systemInfo.nombreSistema)}</sum1:NombreSistemaInformatico>
            <sum1:IdSistemaInformatico>${systemInfo.idSistema}</sum1:IdSistemaInformatico>
            <sum1:Version>${systemInfo.version}</sum1:Version>
            <sum1:NumeroInstalacion>${systemInfo.numeroInstalacion}</sum1:NumeroInstalacion>
            <sum1:TipoUsoPosibleSoloVerifactu>N</sum1:TipoUsoPosibleSoloVerifactu>
            <sum1:TipoUsoPosibleMultiOT>S</sum1:TipoUsoPosibleMultiOT>
            <sum1:IndicadorMultiplesOT>S</sum1:IndicadorMultiplesOT>
          </sum1:SistemaInformatico>
          <sum1:FechaHoraHusoGenRegistro>${record.timestamp}</sum1:FechaHoraHusoGenRegistro>
          <sum1:TipoHuella>01</sum1:TipoHuella>
          <sum1:Huella>${record.hash}</sum1:Huella>
        </sum1:RegistroAlta>
      </sum:RegistroFactura>
    </sum:RegFactuSistemaFacturacion>
  </soapenv:Body>
</soapenv:Envelope>`;

    return xml;
  }

  /**
   * Build complete SOAP envelope for invoice cancellation (Anulacion)
   * Construir sobre SOAP completo para anulación de factura
   */
  buildRegistroAnulacion(
    cancellation: CancelInvoiceDto,
    record: BlockchainRecord,
    systemInfo: SystemInfoType,
    previousInvoice?: PreviousInvoiceInfo,
  ): string {
    const fechaFormatted = this.formatDate(cancellation.invoiceDate);

    // Build encadenamiento - for first record use PrimerRegistro, otherwise use RegistroAnterior
    const encadenamientoXml = this.buildEncadenamiento(
      cancellation.sellerID,
      previousInvoice,
      record.previousHash,
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="${this.NS_SOAPENV}"
xmlns:sum="${this.NS_SUMINISTRO_LR}"
xmlns:sum1="${this.NS_SUMINISTRO_INFO}"
xmlns:xd="${this.NS_XMLDSIG}">
  <soapenv:Header/>
  <soapenv:Body>
    <sum:RegFactuSistemaFacturacion>
      <sum:Cabecera>
        <sum1:ObligadoEmision>
          <sum1:NombreRazon>${this.escapeXml(cancellation.sellerName || '')}</sum1:NombreRazon>
          <sum1:NIF>${cancellation.sellerID}</sum1:NIF>
        </sum1:ObligadoEmision>
      </sum:Cabecera>
      <sum:RegistroFactura>
        <sum1:RegistroAnulacion>
          <sum1:IDVersion>1.0</sum1:IDVersion>
          <sum1:IDFactura>
            <sum1:IDEmisorFacturaAnulada>${cancellation.sellerID}</sum1:IDEmisorFacturaAnulada>
            <sum1:NumSerieFacturaAnulada>${this.escapeXml(cancellation.invoiceNumber)}</sum1:NumSerieFacturaAnulada>
            <sum1:FechaExpedicionFacturaAnulada>${fechaFormatted}</sum1:FechaExpedicionFacturaAnulada>
          </sum1:IDFactura>
          <sum1:Encadenamiento>
            ${encadenamientoXml}
          </sum1:Encadenamiento>
          <sum1:SistemaInformatico>
            <sum1:NombreRazon>${this.escapeXml(systemInfo.nombreRazon)}</sum1:NombreRazon>
            <sum1:NIF>${systemInfo.nif}</sum1:NIF>
            <sum1:NombreSistemaInformatico>${this.escapeXml(systemInfo.nombreSistema)}</sum1:NombreSistemaInformatico>
            <sum1:IdSistemaInformatico>${systemInfo.idSistema}</sum1:IdSistemaInformatico>
            <sum1:Version>${systemInfo.version}</sum1:Version>
            <sum1:NumeroInstalacion>${systemInfo.numeroInstalacion}</sum1:NumeroInstalacion>
            <sum1:TipoUsoPosibleSoloVerifactu>N</sum1:TipoUsoPosibleSoloVerifactu>
            <sum1:TipoUsoPosibleMultiOT>S</sum1:TipoUsoPosibleMultiOT>
            <sum1:IndicadorMultiplesOT>S</sum1:IndicadorMultiplesOT>
          </sum1:SistemaInformatico>
          <sum1:FechaHoraHusoGenRegistro>${record.timestamp}</sum1:FechaHoraHusoGenRegistro>
          <sum1:TipoHuella>01</sum1:TipoHuella>
          <sum1:Huella>${record.hash}</sum1:Huella>
        </sum1:RegistroAnulacion>
      </sum:RegistroFactura>
    </sum:RegFactuSistemaFacturacion>
  </soapenv:Body>
</soapenv:Envelope>`;

    return xml;
  }

  /**
   * Build Encadenamiento (chaining) XML section
   * According to AEAT spec, must chain to the immediately previous record
   */
  private buildEncadenamiento(
    sellerId: string,
    previousInvoice: PreviousInvoiceInfo | undefined,
    previousHash: string,
  ): string {
    // Check if this is the first record (no previous hash or all zeros)
    const isFirstRecord =
      !previousHash || previousHash === '0'.repeat(64) || previousHash === '';

    if (isFirstRecord) {
      return '<sum1:PrimerRegistro>S</sum1:PrimerRegistro>';
    }

    // If we have previous invoice info, use it; otherwise use placeholder
    if (previousInvoice) {
      return `<sum1:RegistroAnterior>
            <sum1:IDEmisorFactura>${previousInvoice.sellerId}</sum1:IDEmisorFactura>
            <sum1:NumSerieFactura>${this.escapeXml(previousInvoice.invoiceNumber)}</sum1:NumSerieFactura>
            <sum1:FechaExpedicionFactura>${this.formatDate(previousInvoice.invoiceDate)}</sum1:FechaExpedicionFactura>
            <sum1:Huella>${previousHash}</sum1:Huella>
          </sum1:RegistroAnterior>`;
    }

    // Fallback: we have a hash but no invoice details
    // This should not happen in production - we need to track previous invoice details
    this.logger.warn(
      'Building encadenamiento with previous hash but no invoice details - this may cause validation errors',
    );
    return `<sum1:RegistroAnterior>
            <sum1:IDEmisorFactura>${sellerId}</sum1:IDEmisorFactura>
            <sum1:NumSerieFactura></sum1:NumSerieFactura>
            <sum1:FechaExpedicionFactura></sum1:FechaExpedicionFactura>
            <sum1:Huella>${previousHash}</sum1:Huella>
          </sum1:RegistroAnterior>`;
  }

  /**
   * Build Destinatarios (buyers) XML section
   */
  private buildDestinatarios(invoice: CreateInvoiceDto): string {
    // Handle foreign buyers with IDOtro
    if (invoice.buyerCountry && invoice.buyerCountry !== 'ES') {
      return `<sum1:Destinatarios>
      <sum1:IDDestinatario>
        <sum1:NombreRazon>${this.escapeXml(invoice.buyerName || '')}</sum1:NombreRazon>
        <sum1:IDOtro>
          <sum1:CodigoPais>${invoice.buyerCountry}</sum1:CodigoPais>
          <sum1:IDType>${invoice.buyerIDType || '02'}</sum1:IDType>
          <sum1:ID>${invoice.buyerID}</sum1:ID>
        </sum1:IDOtro>
      </sum1:IDDestinatario>
    </sum1:Destinatarios>`;
    }

    // Spanish buyer with NIF
    return `<sum1:Destinatarios>
      <sum1:IDDestinatario>
        <sum1:NombreRazon>${this.escapeXml(invoice.buyerName || '')}</sum1:NombreRazon>
        <sum1:NIF>${invoice.buyerID}</sum1:NIF>
      </sum1:IDDestinatario>
    </sum1:Destinatarios>`;
  }

  /**
   * Build DetalleDesglose (tax breakdown) XML section
   * According to AEAT spec, each DetalleDesglose contains tax details
   */
  private buildDetalleDesglose(taxItems: TaxItemDto[]): string {
    return taxItems
      .map((item) => {
        const claveRegimen = item.taxScheme || ClaveRegimen.RegimenGeneral;
        const calificacion = item.taxType || CalificacionOperacion.S1;
        const impuesto = item.impuesto || '01'; // 01 = IVA

        let xml = `<sum1:DetalleDesglose>
            <sum1:Impuesto>${impuesto}</sum1:Impuesto>
            <sum1:ClaveRegimen>${claveRegimen}</sum1:ClaveRegimen>
            <sum1:CalificacionOperacion>${calificacion}</sum1:CalificacionOperacion>
            <sum1:TipoImpositivo>${this.formatNumber(item.taxRate)}</sum1:TipoImpositivo>
            <sum1:BaseImponibleOimporteNoSujeto>${this.formatNumber(item.taxBase)}</sum1:BaseImponibleOimporteNoSujeto>
            <sum1:CuotaRepercutida>${this.formatNumber(item.taxAmount)}</sum1:CuotaRepercutida>`;

        if (item.equivalenceSurchargeRate !== undefined) {
          xml += `
            <sum1:TipoRecargoEquivalencia>${this.formatNumber(item.equivalenceSurchargeRate)}</sum1:TipoRecargoEquivalencia>`;
        }

        if (item.equivalenceSurchargeAmount !== undefined) {
          xml += `
            <sum1:CuotaRecargoEquivalencia>${this.formatNumber(item.equivalenceSurchargeAmount)}</sum1:CuotaRecargoEquivalencia>`;
        }

        xml += `
          </sum1:DetalleDesglose>`;

        return xml;
      })
      .join('\n          ');
  }

  /**
   * Format date from YYYY-MM-DD to DD-MM-YYYY (AEAT format)
   */
  private formatDate(date: string): string {
    if (!date) return '';
    // If already in DD-MM-YYYY format, return as is
    if (date.includes('-') && date.split('-')[0].length === 2) {
      return date;
    }
    // Convert from YYYY-MM-DD to DD-MM-YYYY
    const parts = date.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return date;
  }

  /**
   * Format number for AEAT - no leading zeros, proper decimal precision
   * According to spec: "los ceros por la izquierda no deberán emplearse"
   */
  private formatNumber(value: number): string {
    if (value === undefined || value === null) return '0';
    // Remove unnecessary trailing zeros but keep at least one decimal place for amounts
    const formatted = value.toFixed(2);
    // Remove trailing zeros after decimal point, but keep at least one digit
    return parseFloat(formatted).toString();
  }

  /**
   * Calculate total tax amount (CuotaTotal)
   */
  private calculateCuotaTotal(taxItems: TaxItemDto[]): number {
    return taxItems.reduce((total, item) => {
      return total + item.taxAmount + (item.equivalenceSurchargeAmount || 0);
    }, 0);
  }

  /**
   * Calculate total amount from tax items
   */
  private calculateTotalAmount(taxItems: TaxItemDto[]): number {
    return taxItems.reduce((total, item) => {
      return (
        total +
        item.taxBase +
        item.taxAmount +
        (item.equivalenceSurchargeAmount || 0)
      );
    }, 0);
  }

  /**
   * Escape XML special characters
   * According to spec section 6.9: & -> &amp;, < -> &lt;
   */
  private escapeXml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Build batch XML for multiple invoice registrations (Lote de Registros)
   * Construir XML por lote para múltiples registros de facturas
   */
  buildLoteRegistros(
    records: Array<{
      invoice: CreateInvoiceDto | CancelInvoiceDto;
      record: BlockchainRecord;
      type: 'alta' | 'anulacion';
    }>,
  ): string {
    // Group records by sellerNif
    const groupedBySeller = records.reduce(
      (acc, { invoice, record, type }) => {
        const sellerNif = invoice.sellerID;
        if (!acc[sellerNif]) {
          acc[sellerNif] = [];
        }
        acc[sellerNif].push({ invoice, record, type });
        return acc;
      },
      {} as Record<
        string,
        Array<{
          invoice: CreateInvoiceDto | CancelInvoiceDto;
          record: BlockchainRecord;
          type: 'alta' | 'anulacion';
        }>
      >,
    );

    // Build XML for each seller group
    const xmlParts: string[] = [];

    for (const sellerNif of Object.keys(groupedBySeller)) {
      const sellerRecords = groupedBySeller[sellerNif];
      const firstInvoice = sellerRecords[0].invoice;

      // Build header for this seller
      let sellerXml = `
<sum:RegFactuSistemaFacturacion>
  <sum:Cabecera>
    <sum1:ObligadoEmision>
      <sum1:NombreRazon>${this.escapeXml(firstInvoice.sellerName || '')}</sum1:NombreRazon>
      <sum1:NIF>${sellerNif}</sum1:NIF>
    </sum1:ObligadoEmision>
  </sum:Cabecera>
  <sum:RegistroFactura>`;

      // Add each record
      for (const { invoice, type } of sellerRecords) {
        const fechaFormatted = this.formatDate(invoice.invoiceDate);

        if (type === 'alta') {
          const createInvoice = invoice as CreateInvoiceDto;
          const totalAmount =
            createInvoice.totalAmount ||
            this.calculateTotalAmount(createInvoice.taxItems);
          sellerXml += `
      <sum1:RegistroAlta>
        <sum1:IDVersion>1.0</sum1:IDVersion>
        <sum1:IDFactura>
          <sum1:IDEmisorFactura>${createInvoice.sellerID}</sum1:IDEmisorFactura>
          <sum1:NumSerieFactura>${this.escapeXml(createInvoice.invoiceNumber)}</sum1:NumSerieFactura>
          <sum1:FechaExpedicionFactura>${fechaFormatted}</sum1:FechaExpedicionFactura>
        </sum1:IDFactura>
        <sum1:NombreRazonEmisor>${this.escapeXml(createInvoice.sellerName || '')}</sum1:NombreRazonEmisor>
        <sum1:TipoFactura>${createInvoice.invoiceType || TipoFactura.F1}</sum1:TipoFactura>
        <sum1:DescripcionOperacion>${this.escapeXml(createInvoice.text || 'Operacion facturada')}</sum1:DescripcionOperacion>
        ${createInvoice.buyerID ? this.buildDestinatarios(createInvoice) : ''}
        <sum1:Desglose>
          ${this.buildDetalleDesglose(createInvoice.taxItems)}
        </sum1:Desglose>
        <sum1:ImporteTotal>${this.formatNumber(totalAmount)}</sum1:ImporteTotal>
      </sum1:RegistroAlta>`;
        } else {
          const cancelInvoice = invoice as CancelInvoiceDto;
          sellerXml += `
      <sum1:RegistroAnulacion>
        <sum1:IDFactura>
          <sum1:IDEmisorFactura>${cancelInvoice.sellerID}</sum1:IDEmisorFactura>
          <sum1:NumSerieFactura>${this.escapeXml(cancelInvoice.invoiceNumber)}</sum1:NumSerieFactura>
          <sum1:FechaExpedicionFactura>${fechaFormatted}</sum1:FechaExpedicionFactura>
        </sum1:IDFactura>
        <sum1:DescripcionOperacion>${this.escapeXml(cancelInvoice.cancellationDetails || 'Anulacion de factura')}</sum1:DescripcionOperacion>
      </sum1:RegistroAnulacion>`;
        }
      }

      sellerXml += `
  </sum:RegistroFactura>
</sum:RegFactuSistemaFacturacion>`;
      xmlParts.push(sellerXml);
    }

    // Wrap in SOAP envelope
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="${this.NS_SOAPENV}"
xmlns:sum="${this.NS_SUMINISTRO_LR}"
xmlns:sum1="${this.NS_SUMINISTRO_INFO}"
xmlns:xd="${this.NS_XMLDSIG}">
  <soapenv:Header/>
  <soapenv:Body>
${xmlParts.join('\n')}
  </soapenv:Body>
</soapenv:Envelope>`;
  }
}

/**
 * System Information Type - Required for XML generation
 * Matches SistemaInformatico structure in AEAT XSD
 */
export interface SystemInfoType {
  nombreRazon: string; // Name/Razon social of the system provider
  nif: string; // NIF of the system provider
  nombreSistema: string; // Name of the billing system
  idSistema: string; // System ID (2 digits)
  version: string; // System version
  numeroInstalacion: string; // Installation number
}

/**
 * Previous Invoice Info - Required for Encadenamiento
 * Contains details of the previous invoice for chaining
 */
export interface PreviousInvoiceInfo {
  sellerId: string; // NIF of the seller
  invoiceNumber: string; // Invoice number
  invoiceDate: string; // Invoice date (YYYY-MM-DD or DD-MM-YYYY)
}
