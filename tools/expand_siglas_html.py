# -*- coding: utf-8 -*-
"""Expand acronyms with (Spanish explanation) outside the main SVG diagram block."""
import re
from pathlib import Path

PATH = Path(r"c:\Users\amuni\Desktop\josanz-proyect\josanz-erp\arquitectura_seguridad_ultra_detallada.html")
text = PATH.read_text(encoding="utf-8")

marker = '<div class="diagram-container">'
idx = text.find(marker)
if idx < 0:
    raise SystemExit("marker not found")
pre = text[:idx]
svg_and_rest = text[idx:]
end_svg = svg_and_rest.find("</svg>")
if end_svg < 0:
    raise SystemExit("</svg> not found")
# include closing </svg>
svg_block = svg_and_rest[: end_svg + len("</svg>")]
post_svg = svg_and_rest[end_svg + len("</svg>") :]

# (pattern, replacement) — order: longer phrases first
RAW: list[tuple[str, str]] = [
    (r"\bCI/CD\b(?!\s*\()", "CI/CD (integración y entrega continuas, Continuous Integration / Delivery)"),
    (r"\bDevSecOps\b(?!\s*\()", "DevSecOps (desarrollo, seguridad y operaciones unificados)"),
    (r"\bISO\s*/\s*IEC\s*27001\b(?!\s*\()", "ISO/IEC 27001 (sistema de gestión de seguridad de la información)"),
    (r"\bISO\s+27001\b(?!\s*\()", "ISO 27001 (sistema de gestión de seguridad de la información)"),
    (r"\bJSON\s+Web\s+Token\b", "JSON Web Token"),  # if spelled out
    (r"\bAlways\s+Encrypted\b(?!\s*\()", "Always Encrypted (cifrado de columna donde el motor no ve texto claro)"),
    (r"\bDynamic\s+Data\s+Masking\b(?!\s*\()", "Dynamic Data Masking (enmascaramiento dinámico de datos)"),
    (r"\bOpenTelemetry\b(?!\s*\()", "OpenTelemetry (estándar de telemetría, métricas/trazas/logs)"),
    (r"\bOpenID\s+Connect\b(?!\s*\()", "OpenID Connect (capa de identidad sobre OAuth2)"),
    (r"\bPolicy\s+Decision\s+Point\b(?!\s*\()", "Policy Decision Point (PDP, punto de decisión de políticas)"),
    (r"\bRequest\s+Context\s+Object\b(?!\s*\()", "Request Context Object (RCO, contexto estructurado de la petición)"),
    (r"\bSoftware\s+Bill\s+of\s+Materials\b(?!\s*\()", "Software Bill of Materials (SBOM, inventario de componentes)"),
    (r"\bRow-Level\s+Security\b(?!\s*\()", "Row-Level Security (RLS, seguridad a nivel de filas en SQL)"),
    (r"\bHardware\s+Security\s+Module\b(?!\s*\()", "Hardware Security Module (HSM)"),
    (r"\bWeb\s+Application\s+Firewall\b(?!\s*\()", "Web Application Firewall (WAF)"),
    (r"\bJSON\s+Web\s+Token\s*\(\s*JWT\s*\)", "JSON Web Token (JWT)"),  # normalize if mixed
    # Acronyms (short)
    (r"\bRGPD\b(?!\s*\()", "RGPD (Reglamento General de Protección de Datos)"),
    (r"\bSGSI\b(?!\s*\()", "SGSI (sistema de gestión de la seguridad de la información; referencia ISO/IEC 27001)"),
    (r"\bTDE\b(?!\s*\()", "TDE (Transparent Data Encryption, cifrado transparente de datos)"),
    (r"\bDDM\b(?!\s*\()", "DDM (Dynamic Data Masking, enmascaramiento dinámico de datos)"),
    (r"\bTLS\b(?!\s*\()", "TLS (Transport Layer Security, cifrado en tránsito)"),
    (r"\bmTLS\b(?!\s*\()", "mTLS (autenticación mutua en tránsito cifrado entre servicios / mutual TLS)"),
    (r"\bHSTS\b(?!\s*\()", "HSTS (HTTP Strict Transport Security, forzar HTTPS)"),
    (r"\bAEAD\b(?!\s*\()", "AEAD (cifrado autenticado con datos asociados)"),
    (r"\bJWT\b(?!\s*\()", "JWT (JSON Web Token, token firmado de acceso)"),
    (r"\bJWKS\b(?!\s*\()", "JWKS (JSON Web Key Set, claves públicas para verificar tokens firmados)"),
    (r"\bMFA\b(?!\s*\()", "MFA (autenticación multifactor)"),
    (r"\bPKCE\b(?!\s*\()", "PKCE (intercambio de prueba de clave para clientes públicos, RFC 7636)"),
    (r"\bOIDC\b(?!\s*\()", "OIDC (OpenID Connect — identidad federada sobre OAuth2)"),
    (r"\bOAuth2\b(?!\s*\()", "OAuth2 (autorización delegada entre aplicaciones)"),
    (r"\bRBAC\b(?!\s*\()", "RBAC (control de acceso basado en roles)"),
    (r"\bABAC\b(?!\s*\()", "ABAC (control de acceso basado en atributos)"),
    (r"\bPDP\b(?!\s*\()", "PDP (Policy Decision Point, punto de decisión de políticas)"),
    (r"\bRCO\b(?!\s*\()", "RCO (Request Context Object, contexto de petición)"),
    (r"\bUEBA\b(?!\s*\()", "UEBA (User and Entity Behavior Analytics, análisis de comportamiento)"),
    (r"\bSIEM\b(?!\s*\()", "SIEM (Security Information and Event Management, correlación de eventos)"),
    (r"\bSOC\b(?!\s*\()", "SOC (Security Operations Center, centro de operaciones de seguridad)"),
    (r"\bWAF\b(?!\s*\()", "WAF (Web Application Firewall, cortafuegos web)"),
    (r"\bAPIM\b(?!\s*\()", "APIM (API Management: gateway y políticas de APIs)"),
    (r"\bCDN\b(?!\s*\()", "CDN (Content Delivery Network, red de distribución de contenidos)"),
    (r"\bDDoS\b(?!\s*\()", "DDoS (ataque de denegación de servicio distribuido)"),
    (r"\bOWASP\b(?!\s*\()", "OWASP (Open Web Application Security Project)"),
    (r"\bORM\b(?!\s*\()", "ORM (Object-Relational Mapping, mapeo objeto-relacional)"),
    (r"\bRLS\b(?!\s*\()", "RLS (Row-Level Security, seguridad a nivel de filas)"),
    (r"\bPII\b(?!\s*\()", "PII (Personally Identifiable Information, datos personales identificativos)"),
    (r"\bSBOM\b(?!\s*\()", "SBOM (Software Bill of Materials, inventario de dependencias)"),
    (r"\bSAST\b(?!\s*\()", "SAST (análisis estático de seguridad del código)"),
    (r"\bSCA\b(?!\s*\()", "SCA (análisis de composición software / dependencias vulnerables)"),
    (r"\bDAST\b(?!\s*\()", "DAST (análisis dinámico de seguridad sobre aplicación en ejecución)"),
    (r"\bEKM\b(?!\s*\()", "EKM (Extensible Key Management, gestión de claves con módulo externo/HSM)"),
    (r"\bHSM\b(?!\s*\()", "HSM (Hardware Security Module, criptografía en hardware)"),
    (r"\bKMS\b(?!\s*\()", "KMS (Key Management Service, servicio de gestión de claves en nube)"),
    (r"\bCMK\b(?!\s*\()", "CMK (Customer-Managed Key, clave administrada por el cliente)"),
    (r"\bDLQ\b(?!\s*\()", "DLQ (Dead Letter Queue, cola de mensajes descartados o fallidos)"),
    (r"\bOPA\b(?!\s*\()", "OPA (Open Policy Agent, motor de políticas declarativas Rego)"),
    (r"\bDAL\b(?!\s*\()", "DAL (Data Access Layer, capa de acceso a datos con políticas)"),
    (r"\bOTel\b(?!\s*\()", "OTel (OpenTelemetry, telemetría unificada)"),
    (r"\bSPIFFE\b(?!\s*\()", "SPIFFE (identidades de carga de trabajo para mTLS)"),
    (r"\bSVID\b(?!\s*\()", "SVID (SPIFFE Verifiable Identity Document, credencial de identidad de servicio)"),
    (r"\bIAM\b(?!\s*\()", "IAM (Identity and Access Management, gestión de identidades y accesos)"),
    (r"\bIdP\b(?!\s*\()", "IdP (Identity Provider, proveedor de identidad, p. ej. Entra ID)"),
    (r"\bSSO\b(?!\s*\()", "SSO (Single Sign-On, inicio de sesión único)"),
    (r"\bMITM\b(?!\s*\()", "MITM (Man-in-the-Middle, atacante en medio de la comunicación)"),
    (r"\bGraphQL\b(?!\s*\()", "GraphQL (consulta tipada; complemento o alternativa a REST sobre HTTP)"),
    (r"\bREST\b(?!\s*\()", "REST (HTTP orientado a recursos y verbos)"),
    (r"\bCRSF\b", "CSRF"),  # typo fix if any
    (r"\bCSRF\b(?!\s*\()", "CSRF (Cross-Site Request Forgery, falsificación de petición entre sitios)"),
    (r"\bXSS\b(?!\s*\()", "XSS (Cross-Site Scripting, ejecución de script en contexto de otro sitio)"),
    (r"\bSQLi\b(?!\s*\()", "SQLi (inyección SQL)"),
    (r"\bLLM\b(?!\s*\()", "LLM (Large Language Model, modelo de lenguaje grande)"),
    (r"\bRAG\b(?!\s*\()", "RAG (Retrieval-Augmented Generation, generación asistida por recuperación de documentos)"),
    (r"\bENS\b(?!\s*\()", "ENS (Esquema Nacional de Seguridad, España)"),
    (r"\bNVD\b(?!\s*\()", "NVD (National Vulnerability Database, base de datos de CVE)"),
    (r"\bCVE\b(?!\s*\()", "CVE (Common Vulnerabilities and Exposures, identificador de vulnerabilidad)"),
    (r"\bWORM\b(?!\s*\()", "WORM (Write Once Read Many, almacenamiento inmutable)"),
    (r"\bKQL\b(?!\s*\()", "KQL (Kusto Query Language, lenguaje de consulta de Sentinel/Azure Data Explorer)"),
    (r"\bDPIA\b(?!\s*\()", "DPIA (Data Protection Impact Assessment, evaluación de impacto en protección de datos)"),
    (r"\bARSO\b(?!\s*\()", "ARSO (derechos de acceso, rectificación, supresión y oposición, RGPD)"),
    (r"\bH/H\b", "H/H (horas-hombre de esfuerzo estimado)"),
    (r"\bAES\b(?!\s*\()", "AES (Advanced Encryption Standard, cifrado simétrico)"),
    (r"\bGCM\b(?!\s*\()", "GCM (Galois/Counter Mode, modo AEAD)"),
    (r"\bOCSP\b(?!\s*\()", "OCSP (Online Certificate Status Protocol, estado de revocación de certificado)"),
    (r"\bCORS\b(?!\s*\()", "CORS (Cross-Origin Resource Sharing, política de orígenes en navegador)"),
    (r"\bCSP\b(?!\s*\()", "CSP (Content Security Policy, cabecera anti-XSS)"),
    (r"\bJTI\b(?!\s*\()", "JTI (JWT ID, identificador único de token para revocación)"),
    (r"\bVM\b(?!\s*\()", "VM (máquina virtual)"),
    (r"\bVNet\b(?!\s*\()", "VNet (Virtual Network, red virtual en nube)"),
    (r"\bZTNA\b(?!\s*\()", "ZTNA (Zero Trust Network Access, acceso con confianza cero)"),
    (r"\bZT\b(?!\s*\()", "ZT (Zero Trust, confianza cero)"),
]

def expand_chunk(chunk: str) -> str:
    out = chunk
    for pat, rep in RAW:
        out = re.sub(pat, rep, out)
    # API last: avoid OpenAPI
    out = re.sub(
        r"(?<!Open)\bAPI\b(?!\s*\()(?! Management)",
        "API (Application Programming Interface, interfaz de programación)",
        out,
    )
    return out


new_pre = expand_chunk(pre)
new_post = expand_chunk(post_svg)
new_text = new_pre + svg_block + new_post

if new_text == text:
    print("No changes applied")
else:
    PATH.write_text(new_text, encoding="utf-8")
    print("Updated", PATH.name, "len delta", len(new_text) - len(text))
