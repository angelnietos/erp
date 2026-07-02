import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const caedocsDir = path.resolve(__dirname, '..');

const docs = [
  {
    input: 'ESPECIFICACION-FUNCIONAL-v3.0.md',
    output: 'especificacion-funcional-v3.0.html',
    badge: 'Funcional',
    badgeClass: 'badge-red',
    accent: 'red',
    subtitle: 'Sistema de Asistencia Inteligente — Plataforma CAE',
  },
  {
    input: 'DISENO-TECNICO-v3.0.md',
    output: 'diseno-tecnico-v3.0.html',
    badge: 'Técnico',
    badgeClass: 'badge-blue',
    accent: 'blue',
    subtitle: 'Diseño Técnico de Referencia — Plataforma CAE',
  },
];

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

function preprocessMarkdown(md) {
  return md.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    return `\n<div class="mermaid">\n${code.trim()}\n</div>\n`;
  });
}

function postProcessHtml(html) {
  return html
    .replace(/<h1 id="[^"]*" class="doc-main-title"[^>]*>[\s\S]*?<\/h1>\s*/i, '')
    .replace(/<h2 id="[^"]*" class="section-title"[^>]*>SISTEMA DE ASISTENCIA[\s\S]*?<\/h2>\s*/i, '')
    .replace(/<h2 id="[^"]*" class="section-title"[^>]*>DISEÑO TÉCNICO[\s\S]*?<\/h2>\s*/i, '')
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
    .replace(/<blockquote>\n<p>([\s\S]*?)<\/p>\n<\/blockquote>/g, '<blockquote class="callout"><p>$1</p></blockquote>')
    .replace(/<pre><code class="language-(\w+)">/g, '<pre class="code-block"><code class="language-$1">');
}

function buildToc(headings) {
  return headings
    .map(
      (h) =>
        `<li><a href="#${h.id}" class="toc-link" data-section="${h.id}">${h.text}</a></li>`
    )
    .join('\n');
}

function wrapHtml({ title, badge, badgeClass, accent, subtitle, body, toc }) {
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
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
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
  </script>
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
          <span class="badge badge-neutral">v3.1</span>
        </div>
      </div>
      <p class="header-subtitle">${subtitle}</p>
      <nav class="doc-nav">
        <a href="index.html" class="nav-pill">Inicio</a>
        <a href="especificacion-funcional-v3.0.html" class="nav-pill${accent === 'red' ? ' active' : ''}">Especificación funcional</a>
        <a href="diseno-tecnico-v3.0.html" class="nav-pill${accent === 'blue' ? ' active' : ''}">Diseño técnico</a>
        <a href="../ARQUITECTURA-CAE-IA.png" class="nav-pill" target="_blank" rel="noopener">Diagrama PNG</a>
      </nav>
    </header>

    <div class="layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-card">
          <p class="sidebar-label">Índice</p>
          <ul class="toc">${toc}</ul>
        </div>
        <div class="sidebar-card sidebar-tip">
          <p class="sidebar-label">Referencia</p>
          <p>Documento alineado con el diagrama maestro <strong>ARQUITECTURA-CAE-IA</strong> y validación progresiva CAE.</p>
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

marked.setOptions({ gfm: true });

for (const doc of docs) {
  const inputPath = path.join(caedocsDir, doc.input);
  const md = fs.readFileSync(inputPath, 'utf8');
  const processed = preprocessMarkdown(md);
  const headings = extractHeadings(md);
  const toc = buildToc(headings);
  let body = marked.parse(processed);
  body = postProcessHtml(body);
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : doc.input;

  const html = wrapHtml({ ...doc, title, body, toc });
  const outPath = path.join(__dirname, doc.output);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Generated:', outPath, `(${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`);
}
