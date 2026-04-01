/**
 * Convierte el valor persistido de una firma (URL, data URL, base64 sin prefijo, texto)
 * en algo usable en <img src> o como texto de conformidad.
 */
export function parseSignatureDisplayValue(raw: string | undefined | null): {
  imageSrc?: string;
  text?: string;
} {
  if (raw == null) return {};
  const sig = raw.trim();
  if (!sig) return {};

  if (sig.startsWith('data:image/')) {
    return { imageSrc: sig.replace(/\s/g, '') };
  }

  if (/^https?:\/\//i.test(sig)) {
    return { imageSrc: sig.trim() };
  }

  const compact = sig.replace(/\s/g, '');
  if (/^image\/(png|jpeg|jpg|webp|gif);base64,/i.test(compact)) {
    return { imageSrc: `data:${compact}` };
  }

  if (compact.length >= 80 && /^[A-Za-z0-9+/]+=*$/.test(compact)) {
    if (compact.startsWith('iVBORw0KGgo')) {
      return { imageSrc: `data:image/png;base64,${compact}` };
    }
    if (compact.startsWith('/9j/')) {
      return { imageSrc: `data:image/jpeg;base64,${compact}` };
    }
  }

  return { text: sig };
}
