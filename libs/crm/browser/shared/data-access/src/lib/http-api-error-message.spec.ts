import type { HttpErrorResponse } from '@angular/common/http';
import { httpApiErrorMessage } from './http-api-error-message';

function mockErr(init: {
  status: number;
  statusText?: string;
  error?: unknown;
  message?: string;
}): HttpErrorResponse {
  return {
    name: 'HttpErrorResponse',
    message: init.message ?? 'Http failure response',
    ok: false,
    headers: null as unknown as HttpErrorResponse['headers'],
    status: init.status,
    statusText: init.statusText ?? '',
    url: null,
    error: init.error,
  } as HttpErrorResponse;
}

describe('httpApiErrorMessage', () => {
  it('returns connection message when status is 0', () => {
    const e = mockErr({ status: 0, statusText: 'Unknown Error' });
    expect(httpApiErrorMessage(e)).toBe('No hay conexión con el servidor');
  });

  it('stringifies numeric message in JSON body', () => {
    const e = mockErr({
      status: 400,
      statusText: 'Bad Request',
      error: { message: 404 },
    });
    expect(httpApiErrorMessage(e, 'fallback')).toBe('404');
  });

  it('uses string message from JSON body', () => {
    const e = mockErr({
      status: 422,
      statusText: 'Unprocessable Entity',
      error: { message: '  Email inválido  ' },
    });
    expect(httpApiErrorMessage(e, 'fallback')).toBe('Email inválido');
  });

  it('joins string array message from validation', () => {
    const e = mockErr({
      status: 400,
      error: { message: ['a', 'b'] },
    });
    expect(httpApiErrorMessage(e, 'fallback')).toBe('a. b');
  });

  it('uses nested string error when present', () => {
    const e = mockErr({
      status: 400,
      error: { error: 'nested' },
    });
    expect(httpApiErrorMessage(e, 'fallback')).toBe('nested');
  });

  it('uses message inside nested error object', () => {
    const e = mockErr({
      status: 400,
      error: { error: { message: '  capa interna  ' } },
    });
    expect(httpApiErrorMessage(e, 'fallback')).toBe('capa interna');
  });

  it('joins nested validation array inside error object', () => {
    const e = mockErr({
      status: 400,
      error: { error: { message: ['x', 'y'] } },
    });
    expect(httpApiErrorMessage(e, 'fallback')).toBe('x. y');
  });

  it('trims plain string error body', () => {
    const e = mockErr({
      status: 400,
      error: '  texto plano  ',
    });
    expect(httpApiErrorMessage(e, 'fallback')).toBe('texto plano');
  });

  it('uses status and statusText when error body is a Blob', () => {
    const blob = new Blob(['{}'], { type: 'application/json' });
    const e = mockErr({
      status: 503,
      statusText: 'Service Unavailable',
      error: blob,
    });
    expect(httpApiErrorMessage(e, 'fb')).toBe('503 Service Unavailable');
  });

  it('uses fallback when error body is Blob without usable status line', () => {
    const blob = new Blob(['x']);
    const e = mockErr({
      status: 503,
      statusText: '   ',
      error: blob,
    });
    expect(httpApiErrorMessage(e, 'solo fallback')).toBe('solo fallback');
  });

  it('uses status and statusText when body has no message', () => {
    const e = mockErr({
      status: 502,
      statusText: 'Bad Gateway',
      error: {},
    });
    expect(httpApiErrorMessage(e, 'fb')).toBe('502 Bad Gateway');
  });

  it('uses fallback when nothing else matches', () => {
    const e = mockErr({
      status: 400,
      statusText: '',
      error: {},
      message: '',
    });
    expect(httpApiErrorMessage(e, 'Mi fallback')).toBe('Mi fallback');
  });
});
