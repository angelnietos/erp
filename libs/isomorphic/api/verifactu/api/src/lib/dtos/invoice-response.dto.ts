import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Invoice submission status types
 * Tipos de estado de envío de factura
 */
export type InvoiceStatus =
  | 'Correcto' // Successfully sent to AEAT
  | 'Error' // Error in submission
  | 'Unknown' // Unknown status
  | 'PendienteEnvio' // Queued for later submission (AEAT unavailable)
  | 'AceptadoConErrores'; // Accepted with warnings

/**
 * Invoice response DTO - Represents the response from AEAT after sending an invoice
 * DTO de respuesta de factura - Representa la respuesta de la AEAT después de enviar una factura
 */
export class InvoiceResponseDto {
  @ApiProperty({
    description:
      'Status of the invoice submission (Estado del envío): Correcto, Error, PendienteEnvio, AceptadoConErrores',
    example: 'Correcto',
    enum: [
      'Correcto',
      'Error',
      'Unknown',
      'PendienteEnvio',
      'AceptadoConErrores',
    ],
  })
  status!: InvoiceStatus;

  @ApiPropertyOptional({
    description: 'CSV (Código Seguro de Verificación) returned by AEAT',
    example: 'ABCD1234567890123456789012345678901234567890',
  })
  csv?: string;

  @ApiPropertyOptional({
    description: 'Error code if submission failed (Código de error)',
    example: 'E001',
  })
  errorCode?: string;

  @ApiPropertyOptional({
    description:
      'Error description if submission failed (Descripción del error)',
    example: 'NIF del emisor no válido',
  })
  errorDescription?: string;

  @ApiPropertyOptional({
    description: 'Full response from AEAT (Respuesta completa de la AEAT)',
    example: '<?xml version="1.0" encoding="UTF-8"?>...',
  })
  response?: string;

  @ApiPropertyOptional({
    description: 'Invoice number (Número de factura)',
    example: 'GIT-EJ-0002',
  })
  invoiceNumber?: string;

  @ApiPropertyOptional({
    description: 'Hash/fingerprint of the invoice record (Huella del registro)',
    example: '4EECCE4DD48C0539665385D61D451BA921B7160CA6FEF46CD3C2E2BC5C778E14',
  })
  hash?: string;

  @ApiPropertyOptional({
    description:
      'QR code URL for validation (URL del código QR para validación)',
    example:
      'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?nif=B72877814&numserie=GITHUB-EJ-004&fecha=04-11-2024&importe=131.4',
  })
  qrUrl?: string;

  @ApiPropertyOptional({
    description:
      'QR code image as base64 string (Imagen del código QR en base64)',
    example: 'iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrImageBase64?: string;

  @ApiPropertyOptional({
    description: 'Timestamp of the submission (Fecha y hora del envío)',
    example: '2024-11-15T12:36:39+01:00',
  })
  timestamp?: string;

  @ApiPropertyOptional({
    description:
      'Wait time in seconds before next submission (Tiempo de espera en segundos)',
    example: 60,
  })
  waitSeconds?: number;

  @ApiPropertyOptional({
    description:
      'Whether the invoice is pending submission to AEAT (queued for retry)',
    example: false,
  })
  pendingSubmission?: boolean;

  @ApiPropertyOptional({
    description:
      'Queue item ID for pending submissions (ID del elemento en cola)',
    example: 'uuid-1234-5678-9012',
  })
  queueItemId?: string;
}

/**
 * Invoice queue item - Represents an item in the processing queue
 * Elemento de cola de facturas - Representa un elemento en la cola de procesamiento
 */
export class InvoiceQueueItemDto {
  @ApiProperty({
    description: 'Unique identifier for the queue item',
    example: 'uuid-1234-5678-9012',
  })
  id!: string;

  @ApiProperty({
    description: 'Invoice data (Datos de la factura)',
  })
  invoice: any;

  @ApiProperty({
    description: 'Queue item status (Estado del elemento)',
    enum: ['pending', 'processing', 'sent', 'error'],
    example: 'pending',
  })
  status!: 'pending' | 'processing' | 'sent' | 'error';

  @ApiPropertyOptional({
    description: 'Response from AEAT (Respuesta de la AEAT)',
  })
  response?: InvoiceResponseDto;

  @ApiProperty({
    description: 'Creation timestamp (Fecha de creación)',
    example: '2024-11-15T12:00:00Z',
  })
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Processing timestamp (Fecha de procesamiento)',
    example: '2024-11-15T12:01:00Z',
  })
  processedAt?: Date;
}
