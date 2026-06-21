/**
 * Catálogo SaaS — reexporta identity-api (fuente única de verdad).
 */
import {
  DEFAULT_TENANT_MODULE_IDS,
  TENANT_MODULE_LABELS_ES,
  TENANT_MODULE_CATALOG,
  normalizeTenantModuleIds,
} from '@josanz-erp/identity-api';

export {
  DEFAULT_TENANT_MODULE_IDS,
  TENANT_MODULE_LABELS_ES,
  TENANT_MODULE_CATALOG,
  normalizeTenantModuleIds,
};

export type TenantModuleCategory =
  | 'core'
  | 'operations'
  | 'finance'
  | 'intelligence';

/** Agrupación visual del panel SaaS (distinta de category en identity-api). */
export const TENANT_MODULE_SAAS_CATEGORY: Readonly<
  Record<string, TenantModuleCategory>
> = {
  dashboard: 'core',
  clients: 'core',
  projects: 'core',
  identity: 'core',
  events: 'operations',
  availability: 'operations',
  services: 'operations',
  inventory: 'operations',
  delivery: 'operations',
  fleet: 'operations',
  rentals: 'operations',
  budgets: 'finance',
  billing: 'finance',
  verifactu: 'finance',
  'ai-insights': 'intelligence',
  reports: 'intelligence',
  audit: 'intelligence',
};

export const TENANT_MODULE_CATEGORY_LABELS_ES: Readonly<
  Record<TenantModuleCategory, string>
> = {
  core: 'Core ERP',
  operations: 'Operaciones',
  finance: 'Finanzas',
  intelligence: 'Inteligencia y control',
};

export type TenantModuleCatalogEntry = {
  id: string;
  label: string;
  category: TenantModuleCategory;
  icon: string;
};

const SAAS_MODULE_ICONS: Readonly<Record<string, string>> = {
  dashboard: 'grid',
  clients: 'users',
  projects: 'briefcase',
  identity: 'key',
  events: 'calendar',
  availability: 'clock',
  services: 'wrench',
  inventory: 'box',
  delivery: 'truck',
  fleet: 'car',
  rentals: 'repeat',
  budgets: 'calculator',
  billing: 'receipt',
  verifactu: 'shield',
  'ai-insights': 'sparkles',
  reports: 'chart',
  audit: 'history',
};

export const TENANT_MODULE_CATALOG_SAAS: readonly TenantModuleCatalogEntry[] =
  TENANT_MODULE_CATALOG.map((m) => ({
    id: m.id,
    label: TENANT_MODULE_LABELS_ES[m.id] ?? m.name,
    category: TENANT_MODULE_SAAS_CATEGORY[m.id] ?? 'core',
    icon: SAAS_MODULE_ICONS[m.id] ?? 'grid',
  }));

/** @deprecated Usar TENANT_MODULE_CATALOG_SAAS */
export const TENANT_MODULE_CATALOG_LEGACY = TENANT_MODULE_CATALOG_SAAS;
