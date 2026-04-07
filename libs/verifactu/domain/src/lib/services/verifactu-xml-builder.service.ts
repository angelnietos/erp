import { Injectable } from '@nestjs/common';

@Injectable()
export class VerifactuXmlBuilderService {
  private readonly NS_SOAPENV = 'http://schemas.xmlsoap.org/soap/envelope/';
  private readonly NS_SUM_LR =
    'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd';
  private readonly NS_SUM_INFO =
    'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd';

  buildRegistroAltaXml(input: {
    sellerNif: string;
    sellerName: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    hash: string;
    previousHash?: string;
    timestamp: string;
  }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="${this.NS_SOAPENV}" xmlns:sum="${this.NS_SUM_LR}" xmlns:sum1="${this.NS_SUM_INFO}">
  <soapenv:Header/>
  <soapenv:Body>
    <sum:RegFactuSistemaFacturacion>
      <sum:Cabecera>
        <sum1:ObligadoEmision>
          <sum1:NombreRazon>${this.escapeXml(input.sellerName)}</sum1:NombreRazon>
          <sum1:NIF>${input.sellerNif}</sum1:NIF>
        </sum1:ObligadoEmision>
      </sum:Cabecera>
      <sum:RegistroFactura>
        <sum1:RegistroAlta>
          <sum1:IDVersion>1.0</sum1:IDVersion>
          <sum1:IDFactura>
            <sum1:IDEmisorFactura>${input.sellerNif}</sum1:IDEmisorFactura>
            <sum1:NumSerieFactura>${this.escapeXml(input.invoiceNumber)}</sum1:NumSerieFactura>
            <sum1:FechaExpedicionFactura>${input.invoiceDate}</sum1:FechaExpedicionFactura>
          </sum1:IDFactura>
          <sum1:NombreRazonEmisor>${this.escapeXml(input.sellerName)}</sum1:NombreRazonEmisor>
          <sum1:TipoFactura>F1</sum1:TipoFactura>
          <sum1:DescripcionOperacion>Factura emitida desde Verifactu API</sum1:DescripcionOperacion>
          <sum1:CuotaTotal>0</sum1:CuotaTotal>
          <sum1:ImporteTotal>${input.totalAmount.toFixed(2)}</sum1:ImporteTotal>
          <sum1:Encadenamiento>
            ${
              input.previousHash
                ? `<sum1:RegistroAnterior><sum1:IDEmisorFactura>${input.sellerNif}</sum1:IDEmisorFactura><sum1:NumSerieFactura>${this.escapeXml(input.invoiceNumber)}</sum1:NumSerieFactura><sum1:FechaExpedicionFactura>${input.invoiceDate}</sum1:FechaExpedicionFactura><sum1:Huella>${input.previousHash}</sum1:Huella></sum1:RegistroAnterior>`
                : '<sum1:PrimerRegistro>S</sum1:PrimerRegistro>'
            }
          </sum1:Encadenamiento>
          <sum1:FechaHoraHusoGenRegistro>${input.timestamp}</sum1:FechaHoraHusoGenRegistro>
          <sum1:TipoHuella>01</sum1:TipoHuella>
          <sum1:Huella>${input.hash}</sum1:Huella>
        </sum1:RegistroAlta>
      </sum:RegistroFactura>
    </sum:RegFactuSistemaFacturacion>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

