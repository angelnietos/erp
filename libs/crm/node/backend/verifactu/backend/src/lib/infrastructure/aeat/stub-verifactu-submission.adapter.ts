import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  VerifactuSubmissionPayload,
  VerifactuSubmissionPort,
  VerifactuSubmissionResult,
} from '@generic-crm/verifactu-core';



/**
 * Simulación local: no llama a AEAT. Sustituye por tu cliente HTTP real cuando
 * `AEAT_SUBMISSION_MODE=http` (ver fábrica en VerifactuModule).
 */
@Injectable()
export class StubVerifactuSubmissionAdapter implements VerifactuSubmissionPort {
  async submit(
    payload: VerifactuSubmissionPayload,
  ): Promise<VerifactuSubmissionResult> {
    const processedAt = new Date().toISOString();
    const idRegistro = `STUB-REG-${payload.invoiceId.replace(/-/g, '').slice(0, 12)}`;
    const huella = createHash('sha256')
      .update(idRegistro, 'utf8')
      .digest('hex');
    return {
      verificationCode: `STUB-${payload.invoiceId.replace(/-/g, '').slice(0, 12)}`,
      ack: {
        environment: 'stub',
        processedAt,
        aeat: {
          csv: `STUB-CSV-${payload.invoiceId.replace(/-/g, '').slice(0, 16)}`,
          idRegistro,
          huella,
        },
        audit: {
          mode: 'stub',
          invoiceNumber: payload.invoiceNumber,
          invoiceId: payload.invoiceId,
          tenantId: payload.tenantId,
        },
      },
    };
  }
}
