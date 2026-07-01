import {
  JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS,
  JOSANZ_FIGMA_EXTERNAL_CLIENT_RAIL_COLORS,
  JOSANZ_FIGMA_HOTEL_RAIL_COLORS,
  JOSANZ_FIGMA_HOTEL_RAIL_LABELS,
} from '../theme/josanz-figma-tokens';

export interface JosanzClientRailPreset {
  label: string;
  color: string;
  sector: string;
}

export const JOSANZ_CLIENT_RAIL_PRESETS: readonly JosanzClientRailPreset[] = [
  ...JOSANZ_FIGMA_HOTEL_RAIL_LABELS.map((label, index) => ({
    label,
    color: JOSANZ_FIGMA_HOTEL_RAIL_COLORS[index] ?? JOSANZ_FIGMA_HOTEL_RAIL_COLORS[0],
    sector: 'Hoteles',
  })),
  {
    label: 'Eventos externos',
    color: JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Externos,
    sector: 'Externos',
  },
  {
    label: 'Espacios',
    color: JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Espacios,
    sector: 'Espacios',
  },
];

export const JOSANZ_CLIENT_RAIL_DEFAULT_COLOR =
  JOSANZ_FIGMA_EXTERNAL_CLIENT_RAIL_COLORS[0];

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }
  return null;
}

export function sectorForClientRailColor(color: string): string {
  const normalized = color.trim().toLowerCase();
  const preset = JOSANZ_CLIENT_RAIL_PRESETS.find(
    (entry) => entry.color.toLowerCase() === normalized,
  );
  return preset?.sector ?? 'Externos';
}

export function clientRailPresetOptions(
  currentColor?: string | null,
): JosanzClientRailPreset[] {
  const presets = [...JOSANZ_CLIENT_RAIL_PRESETS];
  const normalized = currentColor?.trim().toLowerCase();
  if (
    normalized &&
    !presets.some((entry) => entry.color.toLowerCase() === normalized)
  ) {
    presets.push({
      label: 'Color guardado',
      color: currentColor!.trim(),
      sector: sectorForClientRailColor(currentColor!),
    });
  }
  return presets;
}

export function defaultClientRailColor(): string {
  return JOSANZ_CLIENT_RAIL_DEFAULT_COLOR;
}
