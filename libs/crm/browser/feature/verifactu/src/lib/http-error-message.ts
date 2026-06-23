import { HttpErrorResponse } from '@angular/common/http';
import { httpApiErrorMessage } from '@generic-crm/shared-browser-data-access';

/** Alias de `httpApiErrorMessage` del paquete shared (compatibilidad). */
export const verifactuHttpErrorMessage = httpApiErrorMessage;

/**
 * Para vistas que combinan varias peticiones (forkJoin): en catchError,
 * registra "Etiqueta: mensaje".
 */
export function appendVerifactuBranchError(
  loadErrors: string[],
  branchLabel: string,
  e: HttpErrorResponse,
): void {
  loadErrors.push(`${branchLabel}: ${httpApiErrorMessage(e)}`);
}

/** Une los fallos de ramas en un solo texto para `loadError` o `null`. */
export function joinVerifactuLoadErrors(errors: string[]): string | null {
  return errors.length > 0 ? errors.join(' · ') : null;
}
