import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';
import { defaultClientTariffPillColor, defaultPillColorForVariant } from './status-pill-presets';
import { normalizeHexColor } from './client-rail-presets';

export interface TenantCatalogTheme {
  eventStatusColors: Partial<Record<JosanzStatusPillKey, string>>;
  clientTariffColors: Record<string, string>;
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

export function defaultTenantCatalogTheme(): TenantCatalogTheme {
  const eventStatusColors: Partial<Record<JosanzStatusPillKey, string>> = {};
  for (const option of TENANT_EVENT_STATUS_OPTIONS) {
    eventStatusColors[option.key] = defaultPillColorForVariant(option.key, 'outline');
  }

  const clientTariffColors: Record<string, string> = {};
  for (const tariff of TENANT_CLIENT_TARIFF_OPTIONS) {
    clientTariffColors[tariff] = defaultClientTariffPillColor(tariff);
  }

  return { eventStatusColors, clientTariffColors };
}

export function mergeTenantCatalogTheme(
  stored?: TenantCatalogTheme | null,
): TenantCatalogTheme {
  const defaults = defaultTenantCatalogTheme();
  const eventStatusColors = { ...defaults.eventStatusColors };
  const clientTariffColors = { ...defaults.clientTariffColors };

  if (stored?.eventStatusColors) {
    for (const [key, value] of Object.entries(stored.eventStatusColors)) {
      const normalized = normalizeHexColor(value ?? '');
      if (normalized) {
        eventStatusColors[key as JosanzStatusPillKey] = normalized;
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

  return { eventStatusColors, clientTariffColors };
}

export function tenantEventStatusColor(
  theme: TenantCatalogTheme | null | undefined,
  variant: JosanzStatusPillKey,
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
