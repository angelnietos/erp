/**
 * One-off / repeatable cleanup: removes nested acronym explosions from expand_siglas_html.*
 * Run: node tools/sanitize_nested_siglas_html.mjs [path-to-html]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target =
  process.argv[2] ??
  path.join(__dirname, "..", "arquitectura_seguridad_ultra_detallada.html");

let s = fs.readFileSync(target, "utf8");

/** Longest / most specific first */
const PAIRS = [
  [
    "ISO 27001 (sistema de gestión de seguridad de la información, SGSI (sistema de gestión de la seguridad de la información, ISO 27001))",
    "ISO 27001 / SGSI (sistema de gestión de la seguridad de la información)",
  ],
  [
    "GraphQL (lenguaje de consulta tipado sobre API (Application Programming Interface, interfaz de programación), alternativa/complemento a REST (estilo de API (Application Programming Interface, interfaz de programación) sobre HTTP con recursos y verbos))",
    "GraphQL (consulta tipada; complemento o alternativa a REST sobre HTTP)",
  ],
  [
    "REST (estilo de API (Application Programming Interface, interfaz de programación) sobre HTTP con recursos y verbos)",
    "REST (HTTP orientado a recursos y verbos)",
  ],
  [
    "(mTLS (TLS (Transport Layer Security, cifrado en tránsito) mutuo, mutual TLS (Transport Layer Security, cifrado en tránsito) entre servicios) pleno o equivalente TLS (Transport Layer Security, cifrado en tránsito)+OAuth entre pares — ver ",
    "(mTLS completo entre servicios o equivalente con cifrado en tránsito y OAuth entre pares — ver ",
  ],
  [
    "mTLS (TLS (Transport Layer Security, cifrado en tránsito) mutuo, mutual TLS (Transport Layer Security, cifrado en tránsito) entre servicios)",
    "mTLS (autenticación mutua en tránsito cifrado entre servicios / mutual TLS)",
  ],
  [
    "OIDC (OpenID Connect, identidad federada sobre OAuth2 (autorización delegada; OpenID Connect añade identidad))",
    "OIDC (OpenID Connect — identidad federada sobre OAuth2)",
  ],
  [
    "APIM (API (Application Programming Interface, interfaz de programación) Management, puerta de enlace y políticas de APIs)",
    "APIM (API Management: gateway y políticas de APIs)",
  ],
  [
    "API (Application Programming Interface, interfaz de programación) Management",
    "API Management",
  ],
  [
    "<strong>TDE (Transparent Data Encryption, cifrado transparente de datos)</strong> (Transparent Data Encryption)</td>",
    "<strong>TDE</strong> (Transparent Data Encryption — cifrado transparente de datos)</td>",
  ],
  [
    "<strong>TLS (Transport Layer Security, cifrado en tránsito) punto a punto</strong>",
    "<strong>TLS punto a punto</strong> (cifrado en tránsito)",
  ],
  [
    "<strong>DDM (Dynamic Data Masking, enmascaramiento dinámico de datos)</strong> a nivel motor (Dynamic Data Masking (enmascaramiento dinámico de datos))</td>",
    "<strong>DDM</strong> a nivel motor (Dynamic Data Masking — enmascaramiento dinámico)</td>",
  ],
];

let total = 0;
for (const [from, to] of PAIRS) {
  const parts = s.split(from);
  const n = parts.length - 1;
  if (n) {
    s = parts.join(to);
    total += n;
    console.log(n, "×", from.slice(0, 72) + (from.length > 72 ? "…" : ""));
  }
}

fs.writeFileSync(target, s, "utf8");
console.log("Wrote", path.basename(target), "replacements:", total);
