/**
 * Corrige paths SVG truncados (p. ej. `a2 0 01` → `a2 2 0 01`) que rompen
 * el renderer de Angular y html2canvas/Playwright al exportar PDF.
 */
export function sanitizeSvgPathsInHtml(html: string): string {
  if (!html.includes('<path') && !html.includes('<PATH')) {
    return html;
  }

  return html.replace(
    /\bd=(["'])([\s\S]*?)\1/gi,
    (_match, quote: string, pathData: string) => {
      const fixed = repairTruncatedSvgArcCommands(pathData);
      return fixed === pathData ? _match : `d=${quote}${fixed}${quote}`;
    },
  );
}

export function repairTruncatedSvgArcCommands(pathData: string): string {
  return pathData
    .replace(/a(\d+(?:\.\d+)?) 0 01/g, 'a$1 2 0 01')
    .replace(/A(\d+(?:\.\d+)?) 0 01/g, 'A$1 2 0 01');
}
