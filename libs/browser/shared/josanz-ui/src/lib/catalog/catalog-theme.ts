import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';
import { pillVariantForCatalogStatus } from './catalog-status';
import { defaultClientTariffPillColor, defaultPillColorForVariant } from './status-pill-presets';
import { normalizeHexColor } from './client-rail-presets';

export interface CustomEventStatusDefinition {
  /** Valor persistido en Event.status (p. ej. CUSTOM_PENDIENTE_FIRMA). */
  value: string;
  label: string;
  color: string;
}

export interface TenantCatalogTheme {
  eventStatusColors: Record<string, string>;
  clientTariffColors: Record<string, string>;
  customEventStatuses?: CustomEventStatusDefinition[];
}

export interface CatalogThemeEventStatusRow {
  key: string;
  label: string;
  color: string;
  removable: boolean;
  customValue?: string;
}

export const TENANT_CLIENT_TARIFF_OPTIONS = [
  'Especial 01',
  'Especial 02',
  'Tarifa estándar',
] as const;

export const TENANT_EVENT_STATUS_OPTIONS: {
  key: JosanzStatusPillKey;
  label: string;
}[] = [
  { key: 'borrador', label: 'Borrador' },
  { key: 'presupuesto', label: 'En presupuesto' },
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'en-produccion', label: 'En producción' },
  { key: 'en-ejecucion', label: 'En ejecución' },
  { key: 'cerrado', label: 'Cerrado' },
  { key: 'facturado', label: 'Facturado' },
  { key: 'cancelado', label: 'Cancelado' },
  { key: 'finalizado', label: 'Finalizado' },
];

export function isDefaultClientTariff(label: string): boolean {
  return (TENANT_CLIENT_TARIFF_OPTIONS as readonly string[]).includes(label);
}

export function customEventStatusValueFromLabel(label: string): string {
  const slug = label
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `CUSTOM_${slug || 'ESTADO'}`;
}

export function customEventStatusPillKey(value: string): string {
  return `custom-${value.toLowerCase().replace(/_/g, '-')}`;
}

export function listClientTariffLabels(theme: TenantCatalogTheme): string[] {
  const keys = new Set<string>([
    ...TENANT_CLIENT_TARIFF_OPTIONS,
    ...Object.keys(theme.clientTariffColors ?? {}),
  ]);
  const custom = [...keys]
    .filter((key) => !isDefaultClientTariff(key))
    .sort((a, b) => a.localeCompare(b, 'es'));
  return [...TENANT_CLIENT_TARIFF_OPTIONS, ...custom];
}

export function listEventStatusRows(theme: TenantCatalogTheme): CatalogThemeEventStatusRow[] {
  const rows: CatalogThemeEventStatusRow[] = TENANT_EVENT_STATUS_OPTIONS.map((opt) => ({
    key: opt.key,
    label: opt.label,
    color:
      normalizeHexColor(theme.eventStatusColors?.[opt.key] ?? '') ??
      defaultPillColorForVariant(opt.key, 'outline'),
    removable: false,
  }));

  for (const custom of theme.customEventStatuses ?? []) {
    const pillKey = customEventStatusPillKey(custom.value);
    rows.push({
      key: pillKey,
      label: custom.label,
      color:
        normalizeHexColor(custom.color) ??
        normalizeHexColor(theme.eventStatusColors?.[pillKey] ?? '') ??
        '#64748B',
      removable: true,
      customValue: custom.value,
    });
  }

  return rows;
}

export function eventStatusOptionsFromTheme(
  theme: TenantCatalogTheme | null | undefined,
): Array<{ value: string; label: string }> {
  const defaults = [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'BUDGET', label: 'En presupuesto' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'IN_PRODUCTION', label: 'En producción' },
    { value: 'IN_EXECUTION', label: 'En ejecución' },
    { value: 'CLOSED', label: 'Cerrado' },
    { value: 'INVOICED', label: 'Facturado' },
    { value: 'CANCELLED', label: 'Cancelado' },
    { value: 'FINALIZED', label: 'Finalizado' },
  ];

  const custom = (theme?.customEventStatuses ?? []).map((entry) => ({
    value: entry.value,
    label: entry.label,
  }));

  return [...defaults, ...custom];
}

export function resolveEventStatusLabel(
  status: string,
  theme?: TenantCatalogTheme | null,
): string {
  const upper = status.toUpperCase();
  const custom = theme?.customEventStatuses?.find(
    (entry) => entry.value.toUpperCase() === upper,
  );
  if (custom) {
    return custom.label;
  }
  return eventStatusLabelFromApi(status);
}

export function eventStatusLabelFromApi(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Borrador',
    BUDGET: 'En presupuesto',
    CONFIRMED: 'Confirmado',
    IN_PRODUCTION: 'En producción',
    IN_EXECUTION: 'En ejecución',
    CLOSED: 'Cerrado',
    INVOICED: 'Facturado',
    CANCELLED: 'Cancelado',
    FINALIZED: 'Finalizado',
    PLANNED: 'Confirmado',
    COMPLETED: 'Finalizado',
  };
  return labels[status.toUpperCase()] ?? status;
}

export function resolveCustomEventStatusColor(
  status: string,
  theme?: TenantCatalogTheme | null,
): string | undefined {
  const upper = status.toUpperCase();
  const custom = theme?.customEventStatuses?.find(
    (entry) => entry.value.toUpperCase() === upper,
  );
  if (!custom) {
    return undefined;
  }
  const pillKey = customEventStatusPillKey(custom.value);
  return (
    normalizeHexColor(custom.color) ??
    normalizeHexColor(theme?.eventStatusColors?.[pillKey] ?? '') ??
    undefined
  );
}

export function resolveEventStatusPillKey(
  status: string,
  theme?: TenantCatalogTheme | null,
): string {
  const upper = status.toUpperCase();
  const custom = theme?.customEventStatuses?.find(
    (entry) => entry.value.toUpperCase() === upper,
  );
  if (custom) {
    return customEventStatusPillKey(custom.value);
  }
  const label = eventStatusLabelFromApi(status);
  return pillVariantForCatalogStatus(label);
}

export function resolveEventStatusPillColor(
  status: string,
  theme?: TenantCatalogTheme | null,
): string | undefined {
  return (
    resolveCustomEventStatusColor(status, theme) ??
    tenantEventStatusColor(theme, resolveEventStatusPillKey(status, theme))
  );
}

export function defaultTenantCatalogTheme(): TenantCatalogTheme {
  const eventStatusColors: Partial<Record<JosanzStatusPillKey, string>> = {};
  for (const option of TENANT_EVENT_STATUS_OPTIONS) {
    eventStatusColors[option.key] = defaultPillColorForVariant(option.key, 'outline');
  }

  const clientTariffColors: Record<string, string> = {};
  for (const tariff of TENANT_CLIENT_TARIFF_OPTIONS) {
    clientTariffColors[tariff] = defaultClientTariffPillColor(tariff);
  }

  return { eventStatusColors, clientTariffColors, customEventStatuses: [] };
}

export function mergeTenantCatalogTheme(
  stored?: TenantCatalogTheme | null,
): TenantCatalogTheme {
  const defaults = defaultTenantCatalogTheme();
  const eventStatusColors = { ...defaults.eventStatusColors };
  const clientTariffColors = { ...defaults.clientTariffColors };
  const customEventStatuses = [...(stored?.customEventStatuses ?? [])];

  if (stored?.eventStatusColors) {
    for (const [key, value] of Object.entries(stored.eventStatusColors)) {
      const normalized = normalizeHexColor(value ?? '');
      if (normalized) {
        eventStatusColors[key] = normalized;
      }
    }
  }

  if (stored?.clientTariffColors) {
    for (const [tariff, value] of Object.entries(stored.clientTariffColors)) {
      const normalized = normalizeHexColor(value ?? '');
      if (normalized) {
        clientTariffColors[tariff] = normalized;
      }
    }
  }

  for (const custom of customEventStatuses) {
    const pillKey = customEventStatusPillKey(custom.value);
    const normalized = normalizeHexColor(custom.color);
    if (normalized) {
      eventStatusColors[pillKey] = normalized;
    }
  }

  return { eventStatusColors, clientTariffColors, customEventStatuses };
}

export function tenantEventStatusColor(
  theme: TenantCatalogTheme | null | undefined,
  variant: string,
): string | undefined {
  const value = theme?.eventStatusColors?.[variant];
  return normalizeHexColor(value ?? '') ?? undefined;
}

export function tenantClientTariffColor(
  theme: TenantCatalogTheme | null | undefined,
  tariff?: string | null,
): string | undefined {
  if (!tariff?.trim()) {
    return undefined;
  }
  const exact = theme?.clientTariffColors?.[tariff.trim()];
  if (exact) {
    return normalizeHexColor(exact) ?? undefined;
  }
  const lower = tariff.trim().toLowerCase();
  for (const [label, color] of Object.entries(theme?.clientTariffColors ?? {})) {
    if (label.toLowerCase() === lower) {
      return normalizeHexColor(color) ?? undefined;
    }
  }
  return undefined;
}

/** Color por defecto de la pastilla para un tipo/tarifa de cliente (tenant + presets). */
export function resolveClientTypePillColor(
  typeLabel: string | null | undefined,
  theme?: TenantCatalogTheme | null,
): string {
  const label = typeLabel?.trim();
  if (!label) {
    return defaultClientTariffPillColor(TENANT_CLIENT_TARIFF_OPTIONS[0]);
  }
  return (
    tenantClientTariffColor(theme, label) ?? defaultClientTariffPillColor(label)
  );
}

export const CLIENT_STATUS_CUSTOM_OPTION = '__custom__';
