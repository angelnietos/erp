import { HttpErrorResponse } from '@angular/common/http';

function messageFromField(msg: unknown): string | null {
  if (Array.isArray(msg)) {
    const parts = msg.filter((m): m is string => typeof m === 'string');
    if (parts.length) {
      return parts.join('. ');
    }
    return null;
  }
  if (typeof msg === 'number' && Number.isFinite(msg)) {
    return String(msg);
  }
  if (typeof msg === 'string' && msg.trim()) {
    return msg.trim();
  }
  return null;
}

function messageFromErrorObject(err: object): string | null {
  const fromMsg = messageFromField((err as { message?: unknown }).message);
  if (fromMsg) {
    return fromMsg;
  }

  const nested = (err as { error?: unknown }).error;
  if (typeof nested === 'string' && nested.trim()) {
    return nested.trim();
  }
  if (nested && typeof nested === 'object') {
    return messageFromField((nested as { message?: unknown }).message);
  }
  return null;
}

/**
 * Mensaje legible desde respuestas de error (Nest ValidationPipe, cuerpo vacío, Blob, etc.).
 * Reutilizable en cualquier feature que llame a la API con HttpClient.
 */
export function httpApiErrorMessage(
  e: HttpErrorResponse,
  fallback = 'Error de red',
): string {
  if (e.status === 0) {
    return 'No hay conexión con el servidor';
  }

  const err = e.error;

  if (typeof err === 'string' && err.trim()) {
    return err.trim();
  }

  if (typeof Blob !== 'undefined' && err instanceof Blob) {
    const st = e.statusText?.trim();
    return e.status >= 400 && st ? `${e.status} ${st}` : fallback;
  }

  if (err && typeof err === 'object') {
    const fromObj = messageFromErrorObject(err);
    if (fromObj) {
      return fromObj;
    }
  }

  const statusText = e.statusText?.trim();
  if (e.status >= 400 && statusText) {
    return `${e.status} ${statusText}`;
  }

  return e.message || fallback;
}
