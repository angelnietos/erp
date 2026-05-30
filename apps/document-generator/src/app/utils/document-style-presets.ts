/** Presets rápidos de estilo compartidos entre preview y PDF. */
export function stylePresetCss(preset: string): string {
  const presets: Record<string, string> = {
    corporate: `
/* document-style-preset:start */
:root {
  --markdown-font-size: 1.05rem;
  --markdown-line-height: 1.72;
  --markdown-color: #1f2937;
  --brand-primary: #7a0000;
  --brand-accent: #ff3131;
}

h1 {
  font-size: clamp(2.25rem, 4vw, 3rem);
  font-weight: 850;
  color: #111827;
  border-bottom: 2px solid rgba(122, 0, 0, 0.22);
  padding-bottom: 0.75rem;
}

h1::before {
  background: linear-gradient(90deg, #7a0000, #ff3131);
}

h2 {
  font-size: clamp(1.55rem, 2.5vw, 2rem);
  font-weight: 800;
  color: #1f2937;
  border-left: 5px solid #ff3131;
  padding-left: 0.85rem;
}

h3 {
  color: #374151;
  font-weight: 750;
}

table {
  border-radius: 12px;
  overflow: hidden;
}

th {
  background: #7a0000;
  color: #ffffff;
}

blockquote {
  background: #fff1f1;
  border-left-color: #ff3131;
  color: #5b0000;
}
/* document-style-preset:end */`,
    compact: `
/* document-style-preset:start */
:root {
  --markdown-font-size: 0.92rem;
  --markdown-line-height: 1.48;
  --markdown-color: #1f2937;
}

h1 {
  font-size: 1.8rem;
  margin: 1rem 0 0.6rem;
}

h2 {
  font-size: 1.35rem;
  margin: 0.85rem 0 0.45rem;
}

h3 {
  font-size: 1.1rem;
  margin: 0.7rem 0 0.35rem;
}

p,
ul,
ol,
table {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

th,
td {
  padding: 0.4rem 0.55rem;
}
/* document-style-preset:end */`,
    large: `
/* document-style-preset:start */
:root {
  --markdown-font-size: 1.22rem;
  --markdown-line-height: 1.86;
  --markdown-color: #111827;
}

h1 {
  font-size: clamp(2.5rem, 5vw, 3.35rem);
}

h2 {
  font-size: clamp(1.85rem, 3vw, 2.35rem);
}

h3 {
  font-size: 1.55rem;
}

th,
td {
  padding: 0.8rem 1rem;
}
/* document-style-preset:end */`,
  };

  return presets[preset] ?? '';
}

export function removeManagedStylePreset(css: string): string {
  return (css || '')
    .replace(
      /\/\* document-style-preset:start \*\/[\s\S]*?\/\* document-style-preset:end \*\//m,
      '',
    )
    .trim();
}
