/**
 * Utilidades de color para temas (WCAG sRGB, hex seguro para CSS).
 * Usadas por ThemeService y consumibles desde apps (p. ej. document-generator).
 */

/** Hex de respuesta cuando la entrada no es un color hex parseable. */
export const FALLBACK_BRAND_HEX = '#6366f1';

export function parseHexColor(
  hex: string | null | undefined,
): { r: number; g: number; b: number } | null {
  if (hex == null || typeof hex !== 'string') return null;
  const s = hex.replace('#', '').trim();
  if (s.length === 6 && /^[0-9a-fA-F]+$/.test(s)) {
    const n = parseInt(s, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  if (s.length === 3 && /^[0-9a-fA-F]+$/.test(s)) {
    return {
      r: parseInt(s[0] + s[0], 16),
      g: parseInt(s[1] + s[1], 16),
      b: parseInt(s[2] + s[2], 16),
    };
  }
  return null;
}

/** `#rrggbb` estable para interpolaciones `color-mix` / `--brand`. */
export function normalizeCssHexColor(
  input: string | null | undefined,
): string | null {
  const p = parseHexColor(input ?? '');
  if (!p) return null;
  const n = (p.r << 16) | (p.g << 8) | p.b;
  return `#${n.toString(16).padStart(6, '0')}`;
}

/**
 * Triplet `r, g, b` para `rgba(...)` en CSS.
 * Si el hex no es válido, usa {@link FALLBACK_BRAND_HEX}.
 */
export function hexToRgbTripletString(hex: string): string {
  const p = parseHexColor(hex);
  if (p) return `${p.r}, ${p.g}, ${p.b}`;
  const fb = parseHexColor(FALLBACK_BRAND_HEX);
  if (fb) return `${fb.r}, ${fb.g}, ${fb.b}`;
  return '99, 102, 241';
}

export function mixRgbHex(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
): string {
  const u = Math.min(1, Math.max(0, t));
  const r = Math.round(a.r * (1 - u) + b.r * u);
  const g = Math.round(a.g * (1 - u) + b.g * u);
  const bl = Math.round(a.b * (1 - u) + b.b * u);
  const n = (r << 16) | (g << 8) | bl;
  return `#${n.toString(16).padStart(6, '0')}`;
}

/** Acerca el texto secundario al color de cuerpo para mejorar legibilidad (WCAG). */
export function accessibleMutedColor(
  mutedHex: string,
  textHex: string,
  isLight: boolean,
): string {
  const m = parseHexColor(mutedHex);
  const t = parseHexColor(textHex);
  if (!m || !t) return mutedHex;
  const pull = isLight ? 0.14 : 0.32;
  return mixRgbHex(m, t, pull);
}

export function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Texto oscuro o claro sobre botones / superficies `--brand`. */
export function pickTextOnBrand(brandHex: string): string {
  const rgb = parseHexColor(brandHex);
  if (!rgb) return '#ffffff';
  const L = relativeLuminance(rgb.r, rgb.g, rgb.b);
  return L > 0.42 ? '#0f172a' : '#ffffff';
}

/** Anillo de foco con buen contraste respecto al fondo (claro / oscuro). */
export function ringFocusFromBrand(brandHex: string, isLight: boolean): string {
  const hex = normalizeCssHexColor(brandHex) ?? FALLBACK_BRAND_HEX;
  return isLight
    ? `color-mix(in srgb, ${hex} 55%, #0f172a)`
    : `color-mix(in srgb, ${hex} 70%, #ffffff)`;
}

/** Heurística alineada con ThemeService (`brightness > 180` ⇒ tema claro). */
export function isLightBackgroundFromHex(
  backgroundHex: string,
  threshold = 180,
): boolean {
  const p = parseHexColor(backgroundHex);
  if (!p) return false;
  const brightness =
    (p.r * 299 + p.g * 587 + p.b * 114) / 1000;
  return brightness > threshold;
}
