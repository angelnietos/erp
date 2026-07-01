import type { JosanzStatusPillVariant } from '../components/main-template-card';
import { getEventOutlinePill } from '../theme/event-status-outline';
import {
  JOSANZ_FIGMA_STATUS_PILLS,
  type JosanzStatusPillKey,
} from '../theme/josanz-figma-tokens';
import { josanzReadableOnSolid } from '../theme/josanz-theme-tokens';
import { normalizeHexColor } from './client-rail-presets';

function resolveStatusPillKey(variant: JosanzStatusPillVariant): JosanzStatusPillKey {
  if (variant === 'primary') {
    return 'borrador';
  }
  if (variant === 'success') {
    return 'confirmado';
  }
  if (variant === 'warning') {
    return 'en-proceso';
  }
  if (variant === 'error') {
    return 'cancelado';
  }
  return variant;
}

/** Color de acento por defecto para una variante de pastilla (borde en outline, texto en filled). */
export function defaultPillColorForVariant(
  variant: JosanzStatusPillVariant,
  badgeStyle: 'filled' | 'outline' = 'filled',
): string {
  const key = resolveStatusPillKey(variant);
  if (badgeStyle === 'outline') {
    return getEventOutlinePill(key).border;
  }
  return JOSANZ_FIGMA_STATUS_PILLS[key]?.text ?? '#64748B';
}

/** Color por defecto de la pastilla de tipo/tarifa en listado Clientes. */
export function defaultClientTariffPillColor(tariff?: string | null): string {
  const value = (tariff ?? '').toLowerCase();
  if (value.includes('02')) {
    return defaultPillColorForVariant('cliente-tipo-green', 'filled');
  }
  if (value.includes('estándar') || value.includes('estandar')) {
    return defaultPillColorForVariant('cliente-tipo-yellow', 'filled');
  }
  if (value.includes('especial 01') || value.includes('especial')) {
    return defaultPillColorForVariant('cliente-tipo-pink', 'filled');
  }
  return defaultPillColorForVariant('cliente-nuevo', 'filled');
}

/** Color por defecto de la pastilla de estado en listado Eventos (borrador al crear). */
export function defaultEventStatusPillColor(
  status = 'DRAFT',
  badgeStyle: 'filled' | 'outline' = 'outline',
): string {
  const label = status.toUpperCase();
  const variantMap: Record<string, JosanzStatusPillVariant> = {
    DRAFT: 'borrador',
    BUDGET: 'presupuesto',
    CONFIRMED: 'confirmado',
    PLANNED: 'confirmado',
    IN_PRODUCTION: 'en-produccion',
    IN_EXECUTION: 'en-ejecucion',
    CLOSED: 'cerrado',
    INVOICED: 'facturado',
    CANCELLED: 'cancelado',
    FINALIZED: 'finalizado',
    COMPLETED: 'finalizado',
  };
  const variant = variantMap[label] ?? 'borrador';
  return defaultPillColorForVariant(variant, badgeStyle);
}

export function resolveCatalogPillColor(
  stored: string | null | undefined,
  variant: JosanzStatusPillVariant,
  badgeStyle: 'filled' | 'outline',
  tenantOverride?: string | null,
): string {
  return (
    normalizeHexColor(stored ?? '') ??
    normalizeHexColor(tenantOverride ?? '') ??
    defaultPillColorForVariant(variant, badgeStyle)
  );
}

/** Color sólido del rail en avatar con iniciales (listado Clientes). */
export function leadingMarkAvatarStyle(railColor: string): Record<string, string> {
  const rail = normalizeHexColor(railColor) ?? railColor;
  return {
    backgroundColor: rail,
    color: josanzReadableOnSolid(rail),
    borderColor: 'transparent',
  };
}

/** @deprecated Usar `leadingMarkAvatarStyle` (solo color rail, sin gradiente). */
export function leadingMarkGradientStyle(
  railColor: string,
  _pillColor?: string,
): Record<string, string> {
  return leadingMarkAvatarStyle(railColor);
}

export function pillOutlineBadgeStyles(accentColor: string): Record<string, string> {
  const accent = normalizeHexColor(accentColor) ?? accentColor;
  return {
    'background-color': `color-mix(in srgb, ${accent} 10%, var(--josanz-surface))`,
    color: accent,
    border: `1px solid ${accent}`,
    'box-shadow': 'none',
    'text-transform': 'none',
    'letter-spacing': '0',
    'font-weight': '600',
  };
}

export function pillOutlineIconRingStyles(accentColor: string): Record<string, string> {
  const accent = normalizeHexColor(accentColor) ?? accentColor;
  return {
    color: accent,
    'border-color': accent,
    'background-color': `color-mix(in srgb, ${accent} 12%, var(--josanz-surface))`,
  };
}

export function pillFilledBadgeStyles(accentColor: string): Record<string, string> {
  const accent = normalizeHexColor(accentColor) ?? accentColor;
  return {
    'background-color': accent,
    color: josanzReadableOnSolid(accent),
    'box-shadow': 'var(--josanz-shadow-sm)',
    'text-transform': 'uppercase',
    'letter-spacing': '0.05em',
  };
}
