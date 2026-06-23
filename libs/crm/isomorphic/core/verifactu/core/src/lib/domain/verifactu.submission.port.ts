import type { VerifactuSubmissionPayload } from './verifactu.types';
import type { VerifactuSubmissionResult } from './verifactu-aeat.contract';

/** Token de inyección para el adaptador de envío a AEAT (stub, HTTP, etc.). */
export const VERIFACTU_SUBMISSION = Symbol('VERIFACTU_SUBMISSION');

/** Puerto de aplicación: un envío de registro Verifactu y su resultado. */
export interface VerifactuSubmissionPort {
  submit(
    payload: VerifactuSubmissionPayload,
  ): Promise<VerifactuSubmissionResult>;
}
