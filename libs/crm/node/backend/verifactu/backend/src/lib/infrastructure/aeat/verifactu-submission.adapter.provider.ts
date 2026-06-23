import { ConfigService } from '@nestjs/config';
import type { VerifactuSubmissionPort } from '@generic-crm/verifactu-core';
import { VERIFACTU_SUBMISSION } from '@generic-crm/verifactu-core';
import { HttpAeatVerifactuSubmissionAdapter } from './http-aeat-verifactu-submission.adapter';
import { StubVerifactuSubmissionAdapter } from './stub-verifactu-submission.adapter';

/**
 * `stub` (por defecto): sin llamada AEAT.
 * `http`: usa {@link HttpAeatVerifactuSubmissionAdapter} — implementación propia del editor.
 */
export function createVerifactuSubmissionAdapter(
  config: ConfigService,
  stub: StubVerifactuSubmissionAdapter,
  http: HttpAeatVerifactuSubmissionAdapter,
): VerifactuSubmissionPort {
  const raw =
    config.get<string>('AEAT_SUBMISSION_MODE') ??
    process.env['AEAT_SUBMISSION_MODE'] ??
    'stub';
  const mode = raw.trim().toLowerCase();
  if (mode === 'http' || mode === 'aeat') {
    return http;
  }
  return stub;
}

export const VERIFACTU_SUBMISSION_FACTORY = {
  provide: VERIFACTU_SUBMISSION,
  useFactory: createVerifactuSubmissionAdapter,
  inject: [
    ConfigService,
    StubVerifactuSubmissionAdapter,
    HttpAeatVerifactuSubmissionAdapter,
  ],
};
