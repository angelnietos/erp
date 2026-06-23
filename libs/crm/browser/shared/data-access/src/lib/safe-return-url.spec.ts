import { isSafeAppInternalPath } from './safe-return-url';

describe('isSafeAppInternalPath', () => {
  it('acepta rutas internas', () => {
    expect(isSafeAppInternalPath('/clients')).toBe(true);
    expect(isSafeAppInternalPath('/verifactu/overview')).toBe(true);
    expect(isSafeAppInternalPath('/identity')).toBe(true);
  });

  it('acepta query en la misma app', () => {
    expect(isSafeAppInternalPath('/verifactu?tab=queue')).toBe(true);
  });

  it('rechaza open redirects y esquemas', () => {
    expect(isSafeAppInternalPath('//evil.com')).toBe(false);
    expect(isSafeAppInternalPath('http://evil.com')).toBe(false);
    expect(isSafeAppInternalPath('https://evil.com')).toBe(false);
    expect(isSafeAppInternalPath('javascript:alert(1)')).toBe(false);
    expect(isSafeAppInternalPath('')).toBe(false);
    expect(isSafeAppInternalPath('clients')).toBe(false);
  });
});
