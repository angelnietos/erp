import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as soap from 'soap';
import { CertificateService } from '../certificate/certificate.service';

/**
 * AEAT SOAP Response Data Interface
 * Interface for the response data structure from AEAT SOAP calls
 */
interface AeatResponseData {
  CSV?: string;
  CodigoError?: string;
  DescripcionError?: string;
  TiempoEspera?: string;
}

/**
 * AEAT SOAP Client Interface
 * Extends soap.Client with AEAT-specific methods that are dynamically generated from WSDL
 *
 * According to WSDL, the port type sfPortTypeVerifactu defines:
 * - RegFactuSistemaFacturacion
 * - ConsultaFactuSistemaFacturacion
 *
 * The soap library dynamically creates methods from WSDL operations.
 * We pass XML strings directly to these methods.
 */
interface AeatSoapClient extends soap.Client {
  // Main VERI*FACTU operations from WSDL
  // Methods are dynamically created by the soap library from WSDL
  RegFactuSistemaFacturacionAsync?(
    args: Record<string, unknown>,
  ): Promise<[AeatResponseData]>;
  ConsultaFactuSistemaFacturacionAsync?(
    args: Record<string, unknown>,
  ): Promise<[AeatResponseData]>;
}

/**
 * AEAT SOAP Service - Handles communication with AEAT web services
 * Servicio SOAP AEAT - Gestiona la comunicación con los servicios web de la AEAT
 */
@Injectable()
export class AeatSoapService {
  private readonly logger = new Logger(AeatSoapService.name);
  private client: AeatSoapClient | null = null;

  constructor(
    private configService: ConfigService,
    private certificateService: CertificateService,
  ) {}

  /**
   * Get the AEAT endpoint URL based on environment
   * Obtener la URL del endpoint de la AEAT según el entorno
   *
   * According to AEAT WSDL (SistemaFacturacion.wsdl):
   * - Test VERI*FACTU: https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP
   * - Test with stamp certificate: https://prewww10.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP
   * - Production VERI*FACTU: https://www1.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP
   * - Production with stamp certificate: https://www10.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP
   */
  private getEndpointUrl(): string {
    const environment = this.configService.get<string>(
      'verifactu.aeatEnvironment',
    );
    if (environment === 'production') {
      return (
        this.configService.get<string>('verifactu.aeatProductionUrl') ||
        'https://www1.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP'
      );
    }
    return (
      this.configService.get<string>('verifactu.aeatTestUrl') ||
      'https://prewww2.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP'
    );
  }

  /**
   * Get the WSDL URL for the AEAT service
   * Obtener la URL del WSDL del servicio de la AEAT
   */
  private getWsdlUrl(): string {
    const environment = this.configService.get<string>(
      'verifactu.aeatEnvironment',
    );
    if (environment === 'production') {
      return 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/SistemaFacturacion.wsdl';
    }
    return 'https://prewww2.aeat.es/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/SistemaFacturacion.wsdl';
  }

  /**
   * Initialize SOAP client with certificate
   * Inicializar cliente SOAP con certificado
   */
  async initializeClient(): Promise<AeatSoapClient> {
    if (this.client) {
      return this.client;
    }

    const endpoint = this.getEndpointUrl();
    const wsdlUrl = this.getWsdlUrl();

    try {
      // Create SOAP client with certificate
      const options: soap.IOptions = {
        wsdl_options: {
          pfx: this.certificateService.getCertificatePem(),
          privateKey: this.certificateService.getPrivateKeyPem(),
          rejectUnauthorized: false, // For test environment
        },
      };

      const createdClient = await soap.createClientAsync(wsdlUrl, options);
      this.client = createdClient as AeatSoapClient;

      // Set the endpoint explicitly (WSDL may have different endpoint)
      this.client.setEndpoint(endpoint);

      // Set security options
      if (this.certificateService.isCertificateLoaded()) {
        this.client.setSecurity(
          new soap.WSSecurityCert(
            this.certificateService.getPrivateKeyPem() || '',
            this.certificateService.getCertificatePem() || '',
            '',
            { hasTimeStamp: false },
          ),
        );
      }

      this.logger.log(`SOAP client initialized for ${endpoint}`);
      return this.client;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to initialize SOAP client: ${err.message}`);
      throw error;
    }
  }

  /**
   * Send invoice registration to AEAT
   * Enviar registro de factura a la AEAT
   *
   * Uses RegFactuSistemaFacturacion operation from WSDL
   * The SOAP body contains RegFactuSistemaFacturacion element with:
   * - Cabecera: Header with obligado emision data
   * - RegistroFactura: Contains either RegistroAlta or RegistroAnulacion
   *
   * @param registroAltaXml - The XML string for RegistroAlta (from XmlBuilderService)
   */
  async sendRegistroAlta(registroAltaXml: string): Promise<AeatResponse> {
    try {
      const client = await this.initializeClient();

      // Log available methods for debugging
      const methods = Object.keys(client).filter(
        (k) =>
          typeof (client as unknown as Record<string, unknown>)[k] ===
          'function',
      );
      this.logger.debug(`Available SOAP methods: ${methods.join(', ')}`);

      // The WSDL defines RegFactuSistemaFacturacion operation
      // The soap library will handle the XML parsing
      // We need to pass the XML as the content of RegFactuSistemaFacturacion
      const args = {
        RegFactuSistemaFacturacion: registroAltaXml,
      };

      // soap library creates async methods with 'Async' suffix
      const possibleMethods = [
        'RegFactuSistemaFacturacionAsync',
        'sfVerifactuRegFactuSistemaFacturacionAsync',
        'SistemaVerifactuRegFactuSistemaFacturacionAsync',
      ];

      let result: [AeatResponseData] | undefined;

      for (const methodName of possibleMethods) {
        if (
          typeof (client as unknown as Record<string, unknown>)[methodName] ===
          'function'
        ) {
          this.logger.debug(`Using method: ${methodName}`);
          result = await (
            client as unknown as Record<
              string,
              (...args: unknown[]) => Promise<[AeatResponseData]>
            >
          )[methodName](args);
          break;
        }
      }

      if (!result) {
        // Fallback: try any async method that matches
        const asyncMethods = methods.filter((m) => m.endsWith('Async'));
        if (asyncMethods.length > 0) {
          this.logger.debug(`Falling back to method: ${asyncMethods[0]}`);
          result = await (
            client as unknown as Record<
              string,
              (...args: unknown[]) => Promise<[AeatResponseData]>
            >
          )[asyncMethods[0]](args);
        } else {
          throw new Error(
            `No suitable SOAP method found. Available: ${methods.join(', ')}`,
          );
        }
      }

      return this.parseResponse(result);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send RegistroAlta: ${err.message}`);

      // Check for HTML response error (common with AEAT test environment)
      if (
        err.message.includes("Cannot use 'in' operator") ||
        err.message.includes('Para mas información') ||
        err.message.includes('cookies')
      ) {
        throw new Error(
          'AEAT test environment returned an HTML page instead of SOAP response. This usually happens when the test environment is unavailable or requires cookie consent. The invoice has been queued for later submission.',
        );
      }

      throw error;
    }
  }

  /**
   * Send invoice cancellation to AEAT
   * Enviar anulación de factura a la AEAT
   *
   * Uses RegFactuSistemaFacturacion operation from WSDL (same as Alta but with RegistroAnulacion)
   *
   * @param registroAnulacionXml - The XML string for RegistroAnulacion (from XmlBuilderService)
   */
  async sendRegistroAnulacion(
    registroAnulacionXml: string,
  ): Promise<AeatResponse> {
    try {
      const client = await this.initializeClient();

      // Log available methods for debugging
      const methods = Object.keys(client).filter(
        (k) =>
          typeof (client as unknown as Record<string, unknown>)[k] ===
          'function',
      );
      this.logger.debug(`Available SOAP methods: ${methods.join(', ')}`);

      // Build the request - pass the XML directly
      const args = {
        RegFactuSistemaFacturacion: registroAnulacionXml,
      };

      // The WSDL defines RegFactuSistemaFacturacion operation
      const possibleMethods = [
        'RegFactuSistemaFacturacionAsync',
        'sfVerifactuRegFactuSistemaFacturacionAsync',
        'SistemaVerifactuRegFactuSistemaFacturacionAsync',
      ];

      let result: [AeatResponseData] | undefined;

      for (const methodName of possibleMethods) {
        if (
          typeof (client as unknown as Record<string, unknown>)[methodName] ===
          'function'
        ) {
          this.logger.debug(`Using method: ${methodName}`);
          result = await (
            client as unknown as Record<
              string,
              (...args: unknown[]) => Promise<[AeatResponseData]>
            >
          )[methodName](args);
          break;
        }
      }

      if (!result) {
        throw new Error(
          `No suitable SOAP method found for cancellation. Available: ${methods.join(', ')}`,
        );
      }

      return this.parseResponse(result);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send RegistroAnulacion: ${err.message}`);
      throw error;
    }
  }

  /**
   * Send batch of records to AEAT (up to 1000 records)
   * Enviar lote de registros a la AEAT (hasta 1000 registros)
   *
   * Uses RegFactuSistemaFacturacion operation with multiple RegistroFactura elements
   *
   * @param loteXml - The XML string for the batch (from XmlBuilderService)
   */
  async sendLoteRegistros(loteXml: string): Promise<AeatResponse> {
    try {
      const client = await this.initializeClient();

      // Build the request - pass the XML directly
      const args = {
        RegFactuSistemaFacturacion: loteXml,
      };

      const possibleMethods = [
        'RegFactuSistemaFacturacionAsync',
        'sfVerifactuRegFactuSistemaFacturacionAsync',
      ];

      let result: [AeatResponseData] | undefined;

      for (const methodName of possibleMethods) {
        if (
          typeof (client as unknown as Record<string, unknown>)[methodName] ===
          'function'
        ) {
          result = await (
            client as unknown as Record<
              string,
              (...args: unknown[]) => Promise<[AeatResponseData]>
            >
          )[methodName](args);
          break;
        }
      }

      if (!result) {
        throw new Error('No suitable SOAP method found for batch submission');
      }

      return this.parseResponse(result);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send LoteRegistros: ${err.message}`);
      throw error;
    }
  }

  /**
   * Query invoice status from AEAT
   * Consultar estado de factura en la AEAT
   *
   * Uses ConsultaFactuSistemaFacturacion operation from WSDL
   *
   * @param nif - NIF of the invoice issuer
   * @param invoiceNumber - Invoice number
   * @param invoiceDate - Invoice date (DD-MM-YYYY format)
   */
  async consultaFactura(
    nif: string,
    invoiceNumber: string,
    invoiceDate: string,
  ): Promise<AeatResponse> {
    try {
      const client = await this.initializeClient();

      // Build query request according to WSDL structure
      const args = {
        ConsultaFactuSistemaFacturacion: {
          Cabecera: {
            IDVersion: '1.0',
            ObligadoEmision: {
              NombreRazon: '',
              NIF: nif,
            },
          },
          FiltroConsulta: {
            PeriodoImputacion: {
              Ejercicio: invoiceDate.split('-')[2],
              Periodo: invoiceDate.split('-')[1],
            },
            NumSerieFactura: invoiceNumber,
          },
        },
      };

      const possibleMethods = [
        'ConsultaFactuSistemaFacturacionAsync',
        'sfVerifactuConsultaFactuSistemaFacturacionAsync',
      ];

      let result: [AeatResponseData] | undefined;

      for (const methodName of possibleMethods) {
        if (
          typeof (client as unknown as Record<string, unknown>)[methodName] ===
          'function'
        ) {
          result = await (
            client as unknown as Record<
              string,
              (...args: unknown[]) => Promise<[AeatResponseData]>
            >
          )[methodName](args);
          break;
        }
      }

      if (!result) {
        throw new Error('No suitable SOAP method found for query');
      }

      return this.parseResponse(result);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to query factura: ${err.message}`);
      throw error;
    }
  }

  /**
   * Parse AEAT response
   * Analizar respuesta de la AEAT
   */
  private parseResponse(result: [AeatResponseData] | undefined): AeatResponse {
    const response: AeatResponse = {
      status: 'Unknown',
      csv: undefined,
      errorCode: undefined,
      errorDescription: undefined,
      rawResponse: JSON.stringify(result),
      waitSeconds: 60,
    };

    try {
      // Check if result is a string (HTML error page from AEAT)
      if (result && typeof result === 'string') {
        const htmlResponse = result as unknown as string;
        // Check for common HTML error patterns
        if (
          htmlResponse.includes('<!DOCTYPE') ||
          htmlResponse.includes('<html') ||
          htmlResponse.includes('cookies') ||
          htmlResponse.includes('Para mas información')
        ) {
          response.status = 'Error';
          response.errorCode = 'HTML_RESPONSE';
          response.errorDescription =
            'AEAT returned an HTML page instead of SOAP response. The test environment may be unavailable or requiring cookie consent. Please try again later or use simulation mode.';
          return response;
        }
      }

      // Extract response data based on AEAT response structure
      if (result && result[0]) {
        const responseData = result[0] as any;

        // Check for CSV (main success indicator)
        if (responseData.CSV) {
          response.csv = responseData.CSV;
        }

        // AEAT VeriFactu responses return a global state (EstadoEnvio)
        // and individual results for each invoice in the batch (RespuestaLinea).
        const estadoGlobal = responseData.EstadoEnvio;

        if (estadoGlobal === 'Correcto' || responseData.CSV) {
          response.status = 'Correcto';
        } else if (
          estadoGlobal === 'ParcialmenteCorrecto' ||
          estadoGlobal === 'AceptoConErrores'
        ) {
          response.status = 'AceptadoConErrores';
          response.errorCode = 'PARTIAL_SUCCESS';
          response.errorDescription =
            'Some records were accepted with errors or warnings.';
        } else if (estadoGlobal === 'Incorrecto') {
          response.status = 'Error';
          response.errorCode = responseData.CodigoError || 'REJECTED';
          response.errorDescription =
            responseData.DescripcionError ||
            'The submission was rejected by AEAT.';
        }

        // Extract individual record errors if any
        if (responseData.RespuestaLinea) {
          const lineas = Array.isArray(responseData.RespuestaLinea)
            ? responseData.RespuestaLinea
            : [responseData.RespuestaLinea];

          lineas.forEach((linea: any, index: number) => {
            if (linea.EstadoRegistro === 'Incorrecto') {
              this.logger.error(
                `Error in record ${index + 1}: ${linea.CodigoErrorRegistro} - ${
                  linea.DescripcionErrorRegistro
                }`,
              );
              if (!response.errorCode) {
                response.errorCode = linea.CodigoErrorRegistro;
                response.errorDescription = linea.DescripcionErrorRegistro;
              }
            }
          });
        }

        // Extract wait time
        if (responseData.TiempoEspera) {
          response.waitSeconds = parseInt(
            String(responseData.TiempoEspera),
            10,
          );
        }
      }
    } catch (parseError) {
      const err = parseError as Error;
      this.logger.warn(`Failed to parse AEAT response: ${err.message}`);

      // Check for the specific 'in' operator error which indicates HTML response
      if (err.message.includes("Cannot use 'in' operator")) {
        response.status = 'Error';
        response.errorCode = 'HTML_RESPONSE';
        response.errorDescription =
          'AEAT returned an HTML page instead of SOAP response. The test environment may be unavailable or requiring cookie consent. Please try again later or use simulation mode.';
      }
    }

    return response;
  }

  /**
   * Close SOAP client
   * Cerrar cliente SOAP
   */
  closeClient(): void {
    this.client = null;
  }

  /**
   * Check AEAT service status
   * Verificar estado del servicio AEAT
   */
  async checkServiceStatus(): Promise<{
    available: boolean;
    endpoint: string;
    environment: string;
    lastChecked: Date;
    message: string;
    wsdlAvailable: boolean;
    soapAvailable: boolean;
  }> {
    const endpoint = this.getEndpointUrl();
    const wsdlUrl = this.getWsdlUrl();
    const environment =
      this.configService.get<string>('verifactu.aeatEnvironment') || 'test';

    try {
      // Use native https module to check service availability
      const https = await import('https');

      // Check both WSDL and SOAP endpoint
      const checkUrl = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const req = https.request(
            url,
            { method: 'GET', timeout: 10000 },
            (res) => {
              resolve(res.statusCode === 200);
            },
          );
          req.on('error', () => resolve(false));
          req.on('timeout', () => {
            req.destroy();
            resolve(false);
          });
          req.end();
        });
      };

      const wsdlAvailable = await checkUrl(wsdlUrl);
      const soapAvailable = await checkUrl(`${endpoint}?wsdl`);

      // Service is only truly available if SOAP endpoint works
      const available = soapAvailable;

      let message = '';
      if (available) {
        message = 'AEAT service is fully available';
      } else if (wsdlAvailable) {
        message =
          'WSDL available but SOAP endpoint is disabled (AEAT test environment limitation)';
      } else {
        message = 'AEAT service is unavailable';
      }

      return {
        available,
        endpoint,
        environment,
        lastChecked: new Date(),
        message,
        wsdlAvailable,
        soapAvailable,
      };
    } catch (error) {
      const err = error as Error;
      return {
        available: false,
        endpoint,
        environment,
        lastChecked: new Date(),
        message: `AEAT service check failed: ${err.message}`,
        wsdlAvailable: false,
        soapAvailable: false,
      };
    }
  }
}

/**
 * AEAT Response interface
 */
export interface AeatResponse {
  status:
    | 'Correcto'
    | 'Error'
    | 'Unknown'
    | 'PendienteEnvio'
    | 'AceptadoConErrores';
  csv?: string;
  errorCode?: string;
  errorDescription?: string;
  rawResponse: string;
  waitSeconds: number;
}
