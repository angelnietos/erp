import { Injectable } from '@nestjs/common';
import {
  AeatClientPort,
  AeatSubmissionRequest,
  AeatSubmissionResponse,
  VerifactuHashService,
  VerifactuXmlBuilderService,
} from '@josanz-erp/verifactu-core';
import * as soap from 'soap';

interface AeatSoapClient extends soap.Client {
  RegFactuSistemaFacturacionAsync?(args: Record<string, unknown>): Promise<[Record<string, unknown>]>;
}

@Injectable()
export class RealAeatClient implements AeatClientPort {
  private readonly endpoint =
    process.env.VERIFACTU_AEAT_ENDPOINT ??
    'https://prewww2.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP';
  private readonly wsdlUrl =
    process.env.VERIFACTU_AEAT_WSDL_URL ??
    'https://prewww2.aeat.es/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/SistemaFacturacion.wsdl';

  constructor(
    private readonly hashService: VerifactuHashService,
    private readonly xmlBuilder: VerifactuXmlBuilderService,
  ) {}

  async submitRecord(request: AeatSubmissionRequest): Promise<AeatSubmissionResponse> {
    const hash = request.currentHash || this.hashService.generateSha256Hash(`${request.tenantId}|${request.invoiceId}|${request.total}`);
    const timestamp = this.hashService.generateTimestamp();
    const registroAltaXml = this.xmlBuilder.buildRegistroAltaXml({
      sellerNif: process.env.VERIFACTU_SELLER_NIF ?? 'B00000000',
      sellerName: process.env.VERIFACTU_SELLER_NAME ?? 'Verifactu Tenant',
      invoiceNumber: request.invoiceId,
      invoiceDate: new Date().toISOString().slice(0, 10).split('-').reverse().join('-'),
      totalAmount: request.total,
      hash,
      previousHash: request.previousHash,
      timestamp,
    });

    const client = (await soap.createClientAsync(this.wsdlUrl, {
      endpoint: this.endpoint,
      wsdl_options: { rejectUnauthorized: false },
    })) as AeatSoapClient;
    client.setEndpoint(this.endpoint);

    const methods = Object.keys(client).filter((k) => k.endsWith('Async'));
    const targetMethod =
      methods.find((m) => m.includes('RegFactuSistemaFacturacion')) ?? methods[0];
    if (!targetMethod) {
      throw new Error('No SOAP async operation found for AEAT Verifactu');
    }

    const result = await (
      client as unknown as Record<string, (args: Record<string, unknown>) => Promise<[Record<string, unknown>]>>
    )[targetMethod]({
      RegFactuSistemaFacturacion: registroAltaXml,
    });

    const raw = result?.[0] ?? {};
    const accepted = !('CodigoError' in raw);
    const aeatReference =
      String((raw as { CSV?: string }).CSV ?? `AEAT-${request.invoiceId.slice(0, 8)}`);

    return {
      accepted,
      aeatReference,
      rawResponse: raw as Record<string, unknown>,
    };
  }
}

