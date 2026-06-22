const PDF_MAGIC = '%PDF';

/** Comprueba que un Blob sea un PDF real (no JSON/HTML de error). */
export async function assertValidPdfBlob(blob: Blob): Promise<void> {
  if (!blob || blob.size < 128) {
    const hint = await readBlobTextPrefix(blob, 400);
    throw new Error(
      describeInvalidPdfResponse(hint, blob?.size ?? 0),
    );
  }

  const header = await readBlobTextPrefix(blob, 8);
  if (!header.startsWith(PDF_MAGIC)) {
    throw new Error(describeInvalidPdfResponse(header, blob.size));
  }
}

async function readBlobTextPrefix(blob: Blob, maxBytes: number): Promise<string> {
  const slice = blob.slice(0, maxBytes);
  return slice.text();
}

function describeInvalidPdfResponse(prefix: string, size: number): string {
  const trimmed = prefix.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as {
        message?: string | string[];
        statusCode?: number;
      };
      const msg = Array.isArray(parsed.message)
        ? parsed.message.join(', ')
        : parsed.message;
      if (msg) {
        return `El servidor no devolvió un PDF válido: ${msg}`;
      }
    } catch {
      /* not JSON */
    }
    return 'El servidor devolvió un error JSON en lugar de un PDF.';
  }

  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return 'El servidor devolvió HTML en lugar de un PDF.';
  }

  return `Archivo PDF inválido (${size} bytes).`;
}
