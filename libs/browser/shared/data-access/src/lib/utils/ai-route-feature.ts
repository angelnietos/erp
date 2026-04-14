/**
 * Identificador de dominio IA alineado con `ALL_BOTS` y la barra lateral del ERP.
 * Usado por el asistente Buddy (orquestador) para contexto y colas por módulo.
 */
export function getAiFeatureFromUrl(url: string): string {
  if (url.includes('/inventory')) return 'inventory';
  if (url.includes('/budgets')) return 'budgets';
  if (url.includes('/projects')) return 'projects';
  if (url.includes('/clients')) return 'clients';
  if (url.includes('/fleet')) return 'fleet';
  if (url.includes('/rentals')) return 'rentals';
  if (url.includes('/audit')) return 'audit';
  if (url.includes('/verifactu')) return 'verifactu';
  if (url.includes('/billing')) return 'billing';
  if (url.includes('/delivery')) return 'delivery';
  if (url.includes('/services')) return 'services';
  if (url.includes('/receipts')) return 'receipts';
  if (url.includes('/events')) return 'events';
  if (url.includes('/reports')) return 'reports';
  if (url.includes('/availability')) return 'availability';
  if (url.includes('/users')) return 'users';
  return 'dashboard';
}
