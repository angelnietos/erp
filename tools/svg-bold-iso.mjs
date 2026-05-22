import { readFileSync, writeFileSync } from "node:fs";

/** 0-based inclusive line indices (same split as before): optional mesh, OTel, Mermaid band */
const SKIP_RANGES = [
  [864, 907],
  [960, 970],
  [1114, 1153],
];

function lineSkipped(i) {
  return SKIP_RANGES.some(([a, b]) => i >= a && i <= b);
}

function shouldExcludeText(prefix, plain) {
  if (/font-style="italic"/.test(prefix)) return true;
  if (/fill="#be185d"/.test(prefix)) return true;
  if (/fill="#ffffff"/i.test(prefix)) return true;
  if (/rgba\s*\(\s*255\s*,\s*255\s*,\s*255/i.test(prefix)) return true;
  return false;
}

/** Inner is already a single bold tspan covering all visible text */
function isFullyBoldSingleTspan(inner) {
  const t = inner.trim();
  const m = t.match(/^<tspan([^>]*)>([\s\S]*)<\/tspan>$/i);
  if (!m) return false;
  if (!/font-weight="700"/.test(m[1]) && !/font-weight='700'/.test(m[1])) return false;
  return !/<[^>]+>/.test(m[2]);
}

/** Re-encode for SVG text: keep existing entities like &amp; intact */
function escapeSvgTextContent(s) {
  return s
    .replace(/&(?!(?:amp|lt|gt|apos|quot|#\d+|#x[0-9a-fA-F]+);)/gi, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function processTextLine(line, lineIndex) {
  const nl = line.endsWith("\n") ? "\n" : "";
  const stripped = line.replace(/\n$/, "");
  if (!/^\s*<text\b/.test(stripped) || !stripped.endsWith("</text>")) return line;
  if (lineSkipped(lineIndex)) return line;

  const openEnd = stripped.indexOf(">");
  if (openEnd === -1) return line;
  const prefix = stripped.slice(0, openEnd + 1);
  const inner = stripped.slice(openEnd + 1, stripped.length - "</text>".length);
  const plain = inner.replace(/<[^>]+>/g, "").replace(/\r/g, "").trim();
  if (!plain) return line;
  if (shouldExcludeText(prefix, plain)) return line;
  if (isFullyBoldSingleTspan(inner)) return line;

  const newInner = `<tspan font-weight="700">${escapeSvgTextContent(plain)}</tspan>`;
  return prefix + newInner + "</text>" + nl;
}

function processFile(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const lines = raw.split(/(?<=\n)/);
  const out = lines.map((line, i) => {
    if (/^\s*<text\b/.test(line) && line.includes("</text>")) return processTextLine(line, i);
    return line;
  });
  writeFileSync(filePath, out.join(""), "utf8");
}

for (const p of process.argv.slice(2)) {
  processFile(p);
  console.log("OK", p);
}
