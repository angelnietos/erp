/**
 * Expand acronyms with (Spanish explanation) outside the main SVG diagram block.
 * Same rules as expand_siglas_html.py — run with: node tools/expand_siglas_html.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PATH = path.join(
  __dirname,
  "..",
  "arquitectura_seguridad_ultra_detallada.html"
);

const text = fs.readFileSync(PATH, "utf8");
const marker = '<div class="diagram-container">';
const idx = text.indexOf(marker);
if (idx < 0) throw new Error("marker not found");
const pre = text.slice(0, idx);
const svgAndRest = text.slice(idx);
const endSvg = svgAndRest.indexOf("</svg>");
if (endSvg < 0) throw new Error("</svg> not found");
const svgBlock = svgAndRest.slice(0, endSvg + "</svg>".length);
const postSvg = svgAndRest.slice(endSvg + "</svg>".length);

/** @type {Array<[string, string]>} */
const RAW = [
  [String.raw`\bCI/CD\b(?!\s*\()`, "CI/CD (integración y entrega continuas, Continuous Integration / Delivery)"],
  [String.raw`\bDevSecOps\b(?!\s*\()`, "DevSecOps (desarrollo, seguridad y operaciones unificados)"],
  [String.raw`\bISO\s*/\s*IEC\s*27001\b(?!\s*\()`, "ISO/IEC 27001 (sistema de gestión de seguridad de la información)"],
  [String.raw`\bISO\s+27001\b(?!\s*\()`, "ISO 27001 (sistema de gestión de seguridad de la información)"],
  [String.raw`\bJSON\s+Web\s+Token\b`, "JSON Web Token"],
  [String.raw`\bAlways\s+Encrypted\b(?!\s*\()`, "Always Encrypted (cifrado de columna donde el motor no ve texto claro)"],
  [String.raw`\bDynamic\s+Data\s+Masking\b(?!\s*\()`, "Dynamic Data Masking (enmascaramiento dinámico de datos)"],
  [String.raw`\bOpenTelemetry\b(?!\s*\()`, "OpenTelemetry (estándar de telemetría, métricas/trazas/logs)"],
  [String.raw`\bOpenID\s+Connect\b(?!\s*\()`, "OpenID Connect (capa de identidad sobre OAuth2)"],
  [String.raw`\bPolicy\s+Decision\s+Point\b(?!\s*\()`, "Policy Decision Point (PDP, punto de decisión de políticas)"],
  [String.raw`\bRequest\s+Context\s+Object\b(?!\s*\()`, "Request Context Object (RCO, contexto estructurado de la petición)"],
  [String.raw`\bSoftware\s+Bill\s+of\s+Materials\b(?!\s*\()`, "Software Bill of Materials (SBOM, inventario de componentes)"],
  [String.raw`\bRow-Level\s+Security\b(?!\s*\()`, "Row-Level Security (RLS, seguridad a nivel de filas en SQL)"],
  [String.raw`\bHardware\s+Security\s+Module\b(?!\s*\()`, "Hardware Security Module (HSM)"],
  [String.raw`\bWeb\s+Application\s+Firewall\b(?!\s*\()`, "Web Application Firewall (WAF)"],
  [String.raw`\bJSON\s+Web\s+Token\s*\(\s*JWT\s*\)`, "JSON Web Token (JWT)"],
  [String.raw`\bRGPD\b(?!\s*\()`, "RGPD (Reglamento General de Protección de Datos)"],
  [String.raw`\bSGSI\b(?!\s*\()`, "SGSI (sistema de gestión de la seguridad de la información; referencia ISO/IEC 27001)"],
  [String.raw`\bTDE\b(?!\s*\()`, "TDE (Transparent Data Encryption, cifrado transparente de datos)"],
  [String.raw`\bDDM\b(?!\s*\()`, "DDM (Dynamic Data Masking, enmascaramiento dinámico de datos)"],
  [String.raw`\bTLS\b(?!\s*\()`, "TLS (Transport Layer Security, cifrado en tránsito)"],
  [String.raw`\bmTLS\b(?!\s*\()`, "mTLS (autenticación mutua en tránsito cifrado entre servicios / mutual TLS)"],
  [String.raw`\bHSTS\b(?!\s*\()`, "HSTS (HTTP Strict Transport Security, forzar HTTPS)"],
  [String.raw`\bAEAD\b(?!\s*\()`, "AEAD (cifrado autenticado con datos asociados)"],
  [String.raw`\bJWT\b(?!\s*\()`, "JWT (JSON Web Token, token firmado de acceso)"],
  [String.raw`\bJWKS\b(?!\s*\()`, "JWKS (JSON Web Key Set, claves públicas para verificar tokens firmados)"],
  [String.raw`\bMFA\b(?!\s*\()`, "MFA (autenticación multifactor)"],
  [String.raw`\bPKCE\b(?!\s*\()`, "PKCE (intercambio de prueba de clave para clientes públicos, RFC 7636)"],
  [String.raw`\bOIDC\b(?!\s*\()`, "OIDC (OpenID Connect — identidad federada sobre OAuth2)"],
  [String.raw`\bOAuth2\b(?!\s*\()`, "OAuth2 (autorización delegada entre aplicaciones)"],
  [String.raw`\bRBAC\b(?!\s*\()`, "RBAC (control de acceso basado en roles)"],
  [String.raw`\bABAC\b(?!\s*\()`, "ABAC (control de acceso basado en atributos)"],
  [String.raw`\bPDP\b(?!\s*\()`, "PDP (Policy Decision Point, punto de decisión de políticas)"],
  [String.raw`\bRCO\b(?!\s*\()`, "RCO (Request Context Object, contexto de petición)"],
  [String.raw`\bUEBA\b(?!\s*\()`, "UEBA (User and Entity Behavior Analytics, análisis de comportamiento)"],
  [String.raw`\bSIEM\b(?!\s*\()`, "SIEM (Security Information and Event Management, correlación de eventos)"],
  [String.raw`\bSOC\b(?!\s*\()`, "SOC (Security Operations Center, centro de operaciones de seguridad)"],
  [String.raw`\bWAF\b(?!\s*\()`, "WAF (Web Application Firewall, cortafuegos web)"],
  [String.raw`\bAPIM\b(?!\s*\()`, "APIM (API Management: gateway y políticas de APIs)"],
  [String.raw`\bCDN\b(?!\s*\()`, "CDN (Content Delivery Network, red de distribución de contenidos)"],
  [String.raw`\bDDoS\b(?!\s*\()`, "DDoS (ataque de denegación de servicio distribuido)"],
  [String.raw`\bOWASP\b(?!\s*\()`, "OWASP (Open Web Application Security Project)"],
  [String.raw`\bORM\b(?!\s*\()`, "ORM (Object-Relational Mapping, mapeo objeto-relacional)"],
  [String.raw`\bRLS\b(?!\s*\()`, "RLS (Row-Level Security, seguridad a nivel de filas)"],
  [String.raw`\bPII\b(?!\s*\()`, "PII (Personally Identifiable Information, datos personales identificativos)"],
  [String.raw`\bSBOM\b(?!\s*\()`, "SBOM (Software Bill of Materials, inventario de dependencias)"],
  [String.raw`\bSAST\b(?!\s*\()`, "SAST (análisis estático de seguridad del código)"],
  [String.raw`\bSCA\b(?!\s*\()`, "SCA (análisis de composición software / dependencias vulnerables)"],
  [String.raw`\bDAST\b(?!\s*\()`, "DAST (análisis dinámico de seguridad sobre aplicación en ejecución)"],
  [String.raw`\bEKM\b(?!\s*\()`, "EKM (Extensible Key Management, gestión de claves con módulo externo/HSM)"],
  [String.raw`\bHSM\b(?!\s*\()`, "HSM (Hardware Security Module, criptografía en hardware)"],
  [String.raw`\bKMS\b(?!\s*\()`, "KMS (Key Management Service, servicio de gestión de claves en nube)"],
  [String.raw`\bCMK\b(?!\s*\()`, "CMK (Customer-Managed Key, clave administrada por el cliente)"],
  [String.raw`\bDLQ\b(?!\s*\()`, "DLQ (Dead Letter Queue, cola de mensajes descartados o fallidos)"],
  [String.raw`\bOPA\b(?!\s*\()`, "OPA (Open Policy Agent, motor de políticas declarativas Rego)"],
  [String.raw`\bDAL\b(?!\s*\()`, "DAL (Data Access Layer, capa de acceso a datos con políticas)"],
  [String.raw`\bOTel\b(?!\s*\()`, "OTel (OpenTelemetry, telemetría unificada)"],
  [String.raw`\bSPIFFE\b(?!\s*\()`, "SPIFFE (identidades de carga de trabajo para mTLS)"],
  [String.raw`\bSVID\b(?!\s*\()`, "SVID (SPIFFE Verifiable Identity Document, credencial de identidad de servicio)"],
  [String.raw`\bIAM\b(?!\s*\()`, "IAM (Identity and Access Management, gestión de identidades y accesos)"],
  [String.raw`\bIdP\b(?!\s*\()`, "IdP (Identity Provider, proveedor de identidad, p. ej. Entra ID)"],
  [String.raw`\bSSO\b(?!\s*\()`, "SSO (Single Sign-On, inicio de sesión único)"],
  [String.raw`\bMITM\b(?!\s*\()`, "MITM (Man-in-the-Middle, atacante en medio de la comunicación)"],
  [String.raw`\bGraphQL\b(?!\s*\()`, "GraphQL (consulta tipada; complemento o alternativa a REST sobre HTTP)"],
  [String.raw`\bREST\b(?!\s*\()`, "REST (HTTP orientado a recursos y verbos)"],
  [String.raw`\bCRSF\b`, "CSRF"],
  [String.raw`\bCSRF\b(?!\s*\()`, "CSRF (Cross-Site Request Forgery, falsificación de petición entre sitios)"],
  [String.raw`\bXSS\b(?!\s*\()`, "XSS (Cross-Site Scripting, ejecución de script en contexto de otro sitio)"],
  [String.raw`\bSQLi\b(?!\s*\()`, "SQLi (inyección SQL)"],
  [String.raw`\bLLM\b(?!\s*\()`, "LLM (Large Language Model, modelo de lenguaje grande)"],
  [String.raw`\bRAG\b(?!\s*\()`, "RAG (Retrieval-Augmented Generation, generación asistida por recuperación de documentos)"],
  [String.raw`\bENS\b(?!\s*\()`, "ENS (Esquema Nacional de Seguridad, España)"],
  [String.raw`\bNVD\b(?!\s*\()`, "NVD (National Vulnerability Database, base de datos de CVE)"],
  [String.raw`\bCVE\b(?!\s*\()`, "CVE (Common Vulnerabilities and Exposures, identificador de vulnerabilidad)"],
  [String.raw`\bWORM\b(?!\s*\()`, "WORM (Write Once Read Many, almacenamiento inmutable)"],
  [String.raw`\bKQL\b(?!\s*\()`, "KQL (Kusto Query Language, lenguaje de consulta de Sentinel/Azure Data Explorer)"],
  [String.raw`\bDPIA\b(?!\s*\()`, "DPIA (Data Protection Impact Assessment, evaluación de impacto en protección de datos)"],
  [String.raw`\bARSO\b(?!\s*\()`, "ARSO (derechos de acceso, rectificación, supresión y oposición, RGPD)"],
  [String.raw`\bH/H\b`, "H/H (horas-hombre de esfuerzo estimado)"],
  [String.raw`\bAES\b(?!\s*\()`, "AES (Advanced Encryption Standard, cifrado simétrico)"],
  [String.raw`\bGCM\b(?!\s*\()`, "GCM (Galois/Counter Mode, modo AEAD)"],
  [String.raw`\bOCSP\b(?!\s*\()`, "OCSP (Online Certificate Status Protocol, estado de revocación de certificado)"],
  [String.raw`\bCORS\b(?!\s*\()`, "CORS (Cross-Origin Resource Sharing, política de orígenes en navegador)"],
  [String.raw`\bCSP\b(?!\s*\()`, "CSP (Content Security Policy, cabecera anti-XSS)"],
  [String.raw`\bJTI\b(?!\s*\()`, "JTI (JWT ID, identificador único de token para revocación)"],
  [String.raw`\bVM\b(?!\s*\()`, "VM (máquina virtual)"],
  [String.raw`\bVNet\b(?!\s*\()`, "VNet (Virtual Network, red virtual en nube)"],
  [String.raw`\bZTNA\b(?!\s*\()`, "ZTNA (Zero Trust Network Access, acceso con confianza cero)"],
  [String.raw`\bZT\b(?!\s*\()`, "ZT (Zero Trust, confianza cero)"],
];

/**
 * @param {string} chunk
 */
function expandChunk(chunk) {
  let out = chunk;
  for (const [pat, rep] of RAW) {
    out = out.replace(new RegExp(pat, "g"), rep);
  }
  out = out.replace(
    /(?<!Open)\bAPI\b(?!\s*\()(?! Management)/g,
    "API (Application Programming Interface, interfaz de programación)"
  );
  return out;
}

const newPre = expandChunk(pre);
const newPost = expandChunk(postSvg);
const newText = newPre + svgBlock + newPost;

if (newText === text) {
  console.log("No changes applied");
} else {
  fs.writeFileSync(PATH, newText, "utf8");
  console.log("Updated", path.basename(PATH), "len delta", newText.length - text.length);
}
