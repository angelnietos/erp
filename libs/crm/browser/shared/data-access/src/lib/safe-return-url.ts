/**
 * Comprueba que una URL sea una ruta interna de la SPA (mismo origen vía router).
 * Rechaza open redirects (`//`, `http:`, `javascript:`, etc.).
 */
export function isSafeAppInternalPath(url: string): boolean {
  const s = url.trim();
  if (!s.startsWith('/')) {
    return false;
  }
  if (s.startsWith('//')) {
    return false;
  }
  const pathPart = s.split('?')[0] ?? '';
  if (pathPart.includes('//')) {
    return false;
  }
  if (pathPart.includes(':')) {
    return false;
  }
  if (pathPart.includes('\\')) {
    return false;
  }
  return true;
}
