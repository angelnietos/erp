import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const caedocsDir = path.resolve(__dirname, '..');

const docs = [
  {
    input: 'RESUMEN-EJECUTIVO-CLIENTE-v3.0.md',
    output: 'resumen-ejecutivo-cliente-v3.0.html',
    badge: 'Resumen',
    badgeClass: 'badge-red',
    accent: 'red',
    subtitle: 'Resumen ejecutivo — validación CAE, auto-aprobación y reducción carga Operaciones',
    version: 'v3.0',
  },
  {
    input: 'ESPECIFICACION-FUNCIONAL-v3.0.md',
    output: 'especificacion-funcional-v3.0.html',
    badge: 'Funcional',
    badgeClass: 'badge-red',
    accent: 'red',
    subtitle: 'Sistema de Asistencia Inteligente — Validación progresiva CAE y reducción carga Operaciones',
    version: 'v3.0',
  },
  {
    input: 'DISENO-TECNICO-v3.0.md',
    output: 'diseno-tecnico-v3.0.html',
    badge: 'Técnico',
    badgeClass: 'badge-blue',
    accent: 'blue',
    subtitle: 'Diseño Técnico de Referencia — Plataforma CAE',
    version: 'v3.0',
  },
  {
    input: 'ARQUITECTURA-CAE-IA.md',
    output: 'arquitectura-cae-ia.html',
    badge: 'Arquitectura',
    badgeClass: 'badge-blue',
    accent: 'blue',
    subtitle: 'Diagrama maestro — Visión funcional + Técnica E2E + MLOps',
    version: 'v3.0',
  },
  {
    input: 'ESTRATEGIA-MIGRACION-FRONTEND-CAE.md',
    output: 'estrategia-migracion-frontend-cae.html',
    badge: 'Estrategia',
    badgeClass: 'badge-blue',
    accent: 'blue',
    subtitle: 'Modernización incremental CAE — Strangler Fig React → Angular',
    version: 'v1.0',
  },
];

/** Maps source .md filenames to their generated .html output, for cross-document links */
const mdToHtml = new Map(docs.map((d) => [d.input, d.output]));

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function stripMd(text) {
  return text.replace(/\*\*/g, '').replace(/`/g, '').trim();
}

/** Same normalization used for heading ids, so hand-written anchors with accents still resolve.
 * marked() percent-encodes non-ASCII characters in href="#..." (e.g. "ó" -> "%C3%B3"), so we
 * decode first, then strip diacritics the same way slugify() does for heading ids. */
function normalizeAnchor(fragment) {
  let decoded = fragment;
  try {
    decoded = decodeURIComponent(fragment);
  } catch {
    // malformed percent-encoding — fall back to the raw fragment
  }
  return decoded
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function extractHeadings(md) {
  const headings = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      const text = stripMd(m[1]);
      if (text.toLowerCase().includes('índice de contenidos')) continue;
      headings.push({ text, id: slugify(text) });
    }
  }
  return headings;
}

/** Repair mermaid blocks broken by marked parsing indented lines as code fences */
function sanitizeMermaidBlocks(html) {
  return html.replace(/<div class="mermaid">([\s\S]*?)<\/div>/g, (_, raw) => {
    let code = raw
      .replace(/<pre><code[^>]*>/gi, '\n')
      .replace(/<\/code><\/pre>/gi, '\n')
      .replace(/<\/?p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return `<div class="mermaid">\n${code}\n</div>`;
  });
}

function postProcessHtml(html) {
  return sanitizeMermaidBlocks(
    html
      .replace(/<h1 id="[^"]*" class="doc-main-title"[^>]*>[\s\S]*?<\/h1>\s*/i, '')
      .replace(/<h2 id="[^"]*" class="section-title"[^>]*>SISTEMA DE ASISTENCIA[\s\S]*?<\/h2>\s*/i, '')
      .replace(/<h2 id="[^"]*" class="section-title"[^>]*>DISEÑO TÉCNICO[\s\S]*?<\/h2>\s*/i, '')
      .replace(
        /<blockquote>\s*<p>Este fichero es la[\s\S]*?<\/blockquote>/i,
        '<div class="arch-diagram"><a href="../ARQUITECTURA-CAE-IA.png" target="_blank" rel="noopener"><img src="../ARQUITECTURA-CAE-IA.png" alt="Diagrama maestro de arquitectura CAE IA" loading="lazy" /></a></div>'
      )
      .replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/g, (_, attrs, inner) => {
        const text = stripMd(inner.replace(/<[^>]+>/g, ''));
        const id = slugify(text);
        return `<h1 id="${id}" class="doc-main-title"${attrs}>${inner}</h1>`;
      })
      .replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_, attrs, inner) => {
        const text = stripMd(inner.replace(/<[^>]+>/g, ''));
        const id = slugify(text);
        return `<h2 id="${id}" class="section-title"${attrs}>${inner}</h2>`;
      })
      .replace(/<h3([^>]*)>([\s\S]*?)<\/h3>/g, (_, attrs, inner) => {
        const text = stripMd(inner.replace(/<[^>]+>/g, ''));
        const id = slugify(text);
        return `<h3 id="${id}" class="subsection-title"${attrs}>${inner}</h3>`;
      })
      .replace(/<table>/g, '<div class="table-wrap"><table>')
      .replace(/<\/table>/g, '</table></div>')
      .replace(
        /<blockquote>\n<p>([\s\S]*?)<\/p>\n<\/blockquote>/g,
        '<blockquote class="callout"><p>$1</p></blockquote>'
      )
      .replace(
        /<pre><code class="language-(\w+)">/g,
        '<pre class="code-block"><code class="language-$1">'
      )
      .replace(/href="(ARQUITECTURA-CAE-IA\.png|diagrams\/[^"]+)"/g, 'href="../$1"')
      .replace(/src="(ARQUITECTURA-CAE-IA\.png|diagrams\/[^"]+)"/g, 'src="../$1"')
      .replace(
        /<p><img src="(\.\.\/diagrams\/[^"]+)"([^>]*)><\/p>/g,
        '<div class="arch-diagram"><img src="$1"$2 loading="lazy" /></div>'
      )
      .replace(/<td>(\s*)—(\s*)<\/td>/g, '<td class="cell-na">No aplica</td>')
      .replace(/<td>(\s*)<strong>—<\/strong>(\s*)<\/td>/g, '<td class="cell-na">No aplica</td>')
      .replace(/<td>(\s*)<em>—<\/em>(\s*)<\/td>/g, '<td class="cell-na">No aplica</td>')
      // Cross-document links: point to the generated .html instead of the source .md
      .replace(/href="([A-Za-z0-9_.-]+\.md)(#[^"]*)?"/g, (m, mdFile, anchor = '') => {
        const htmlFile = mdToHtml.get(mdFile);
        return htmlFile ? `href="${htmlFile}${anchor}"` : m;
      })
      // In-page anchors: normalize accents so hand-written links match generated heading ids
      .replace(/href="#([^"]+)"/g, (_, frag) => `href="#${normalizeAnchor(frag)}"`)
  );
}

function buildToc(headings) {
  return headings
    .map(
      (h) =>
        `<li><a href="#${h.id}" class="toc-link" data-section="${h.id}">${h.text}</a></li>`
    )
    .join('\n');
}

function wrapHtml({ title, badge, badgeClass, accent, subtitle, body, toc, version }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — CAE IA v3.0</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="switch-theme.css" />
</head>
<body class="accent-${accent}">
  <div class="joycon joycon-left" aria-hidden="true"></div>
  <div class="joycon joycon-right" aria-hidden="true"></div>

  <div class="app-shell">
    <header class="top-bar">
      <div class="top-bar-inner">
        <div class="brand">
          <span class="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none"><rect x="4" y="12" width="40" height="24" rx="6" fill="currentColor" opacity=".15"/><rect x="8" y="16" width="32" height="16" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="24" r="3" fill="currentColor"/><circle cx="32" cy="24" r="3" fill="currentColor"/></svg>
          </span>
          <div>
            <p class="brand-kicker">Plataforma CAE · Desarrollo IA</p>
            <h1 class="brand-title">${title}</h1>
          </div>
        </div>
        <div class="header-meta">
          <span class="badge ${badgeClass}">${badge}</span>
          <span class="badge badge-neutral">${version}</span>
        </div>
      </div>
      <p class="header-subtitle">${subtitle}</p>
      <nav class="doc-nav">
        <a href="index.html" class="nav-pill">Inicio</a>
        <a href="resumen-ejecutivo-cliente-v3.0.html" class="nav-pill${badge === 'Resumen' ? ' active' : ''}">Resumen ejecutivo</a>
        <a href="especificacion-funcional-v3.0.html" class="nav-pill${badge === 'Funcional' ? ' active' : ''}">Especificación funcional</a>
        <a href="diseno-tecnico-v3.0.html" class="nav-pill${accent === 'blue' && badge === 'Técnico' ? ' active' : ''}">Diseño técnico</a>
        <a href="arquitectura-cae-ia.html" class="nav-pill${accent === 'blue' && badge === 'Arquitectura' ? ' active' : ''}">Arquitectura</a>
        <a href="estrategia-migracion-frontend-cae.html" class="nav-pill${badge === 'Estrategia' ? ' active' : ''}">Estrategia migración</a>
      </nav>
    </header>

    <div class="layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-card">
          <p class="sidebar-label">Índice</p>
          <ul class="toc">${toc}</ul>
        </div>
      </aside>

      <main class="content-card">
        <article class="prose">${body}</article>
        <footer class="doc-footer">
          <p>Confidencial — IDEAUTO / Babooni · Generado ${new Date().toLocaleDateString('es-ES')}</p>
        </footer>
      </main>
    </div>
  </div>

  <button class="fab-top" id="fabTop" aria-label="Volver arriba">↑</button>

  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true, htmlLabels: true, padding: 12, nodeSpacing: 30, rankSpacing: 40 },
      themeVariables: {
        primaryColor: '${accent === 'red' ? '#ffe5e8' : '#e0f7ff'}',
        primaryTextColor: '#1a1a2e',
        primaryBorderColor: '${accent === 'red' ? '#e60012' : '#0ab9e5'}',
        lineColor: '#4a4a68',
        secondaryColor: '#f5f5f7',
        tertiaryColor: '#ffffff',
        fontFamily: 'Nunito, sans-serif',
      },
    });

    const nodes = document.querySelectorAll('.mermaid');
    if (nodes.length) {
      await mermaid.run({ nodes });
      document.querySelectorAll('.mermaid svg').forEach((svg) => {
        svg.removeAttribute('height');
        svg.style.maxWidth = '100%';
        svg.style.width = '100%';
        svg.style.height = 'auto';
        const viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
      });
    }
  </script>

  <script>
    const fab = document.getElementById('fabTop');
    fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      fab.classList.toggle('visible', window.scrollY > 400);
    });

    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = [...tocLinks]
      .map((a) => document.getElementById(a.dataset.section))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tocLinks.forEach((l) =>
              l.classList.toggle('active', l.dataset.section === entry.target.id)
            );
          }
        });
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  </script>
</body>
</html>`;
}

marked.use({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      if (lang === 'mermaid') {
        return `<div class="mermaid">\n${text.trim()}\n</div>\n`;
      }
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre class="code-block"><code class="language-${lang ?? 'text'}">${escaped}</code></pre>\n`;
    },
  },
});

for (const doc of docs) {
  const inputPath = path.join(caedocsDir, doc.input);
  const md = fs.readFileSync(inputPath, 'utf8');
  const headings = extractHeadings(md);
  const toc = buildToc(headings);
  let body = marked.parse(md);
  body = postProcessHtml(body);
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : doc.input;

  const html = wrapHtml({ ...doc, title, body, toc });
  const outPath = path.join(__dirname, doc.output);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Generated:', outPath, `(${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`);
}
