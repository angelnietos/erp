import { HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  OperatorFunction,
  of,
  throwError,
} from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Mensaje legible desde cuerpo Nest o red. */
export function httpErrorMessage(err: HttpErrorResponse): string {
  const body = err.error as { message?: string | string[] } | undefined;
  if (body && typeof body.message === 'string') {
    return body.message;
  }
  if (Array.isArray(body?.message)) {
    return body.message.join(', ');
  }
  return err.message || 'Error de red';
}

/**
 * Tras GET de detalle: 404 / 400 → `undefined` (no encontrado o id inválido).
 * Otros errores se propagan como `Error` con mensaje del servidor.
 */
export function catchHttpDetailNotFound<T>(): OperatorFunction<T, T | undefined> {
  return catchError((err: HttpErrorResponse): Observable<T | undefined> => {
    if (err.status === 404 || err.status === 400) {
      return of(undefined) as Observable<T | undefined>;
    }
    return throwError(() => new Error(httpErrorMessage(err)));
  }) as OperatorFunction<T, T | undefined>;
}
