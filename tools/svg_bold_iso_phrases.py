# -*- coding: utf-8 -*-
"""Wrap ISO-27001-core phrases in SVG <text> nodes with <tspan font-weight="700">...</tspan>.
Skips optional pink blocks (7A, OTel card, Mermaid band) by 0-based line index ranges."""

from pathlib import Path

# Inclusive 0-based line indices to skip (optional / non-baseline ISO for this diagram)
SKIP_RANGES = [
    (864, 907),   # CAPA 7A optional panel + cards
    (960, 970),   # OpenTelemetry optional card
    (1114, 1153), # svg-mermaid-opcional group
]

# Longest first to avoid partial overlaps
PHRASES = [
    "TLS 1.2 / 1.3 only",
    "SASL/SCRAM-SHA-512",
    "Authorization code PKCE",
    "FIDO2 authenticators",
    "Passkeys (resident key)",
    "TOTP RFC 6238",
    "RS256 / ES256",
    "JWT pre-validation",
    "API key validation",
    "Schema validation",
    "SQLi / XSS / CSRF",
    "OWASP CRS 3.2",
    "DDoS L3/L4 prot.",
    "429 + Retry-After",
    "Per IP / per user",
    "Per endpoint",
    "Circuit breaker",
    "Customer-managed key",
    "Key rotation 90d",
    "AES-256 at rest",
    "AES-256-GCM cipher",
    "HSTS preload",
    "OCSP stapling",
    "Always Encrypted cols",
    "SQL Server Audit",
    "Defender for SQL",
    "Backups nativos cifrados",
    "DDM (roles SQL)",
    "Row-level security",
    "Multi-tenancy filter",
    "Parameterized queries",
    "Migration versioning",
    "TDE encryption",
    "Log encryption",
    "Log retention 1 year",
    "MS Sentinel SIEM",
    "KQL detection rules",
    "Incident automation",
    "MITRE ATT&CK map",
    "WORM blob storage",
    "Cryptographic chaining",
    "Compliance export",
    "Inmutables WORM",
    "PITR 35 días",
    "LTR hasta 10 años",
    "Azure Key Vault",
    "Managed HSM",
    "JWT signing keys",
    "Secret scanning CI",
    "No env vars in code",
    "Managed identity pull",
    "JTI revocation list",
    "Token introspection",
    "Conditional access",
    "PIM privileged roles",
    "Identity protection",
    "Client credentials",
    "Open Policy Agent",
    "Just-in-time access",
    "Session TTL / sliding",
    "Cluster + replicas",
    "Encrypted at rest",
    "express-rate-limit",
    "JWT validation",
    "Out: mask PII (rol)",
    "DTO / GraphQL mask",
    "Mask PII en resolvers",
    "Data masking — API",
    "Masking API:",
    "HMAC-SHA256",
    "Topic ACL per service",
    "Partitions encrypted",
    "Consumer groups IAM",
    "Audit DLQ entries",
    "CodeQL · SARIF en PR",
    "Secret scan · gitleaks",
    "OIDC Azure · sin PAT",
    "Coverage umbral CI",
    "Contract tests (Pact)",
    "Testcontainers · emuladores",
    "Datos ficticios · no PII",
    "OWASP ZAP · DAST activo",
    "CycloneDX / SPDX SBOM",
    "SLSA provenance · attest",
    "cosign · Sigstore",
    "SAST + calidad",
    "JWT: JWKS",
    "Helmet · express-rate-limit",
    "ORM Prisma/Sequelize:",
    "SQL parametrizado",
    "mTLS for B2B",
    "ECDHE key exchange",
]


def line_skipped(i: int) -> bool:
    for a, b in SKIP_RANGES:
        if a <= i <= b:
            return True
    return False


def process_text_line(line: str) -> str:
    stripped = line.rstrip("\n")
    if "<text" not in stripped or "</text>" not in stripped:
        return line
    if "<tspan" in stripped or "</tspan>" in stripped:
        return line
    m = stripped
    if not m.endswith("</text>"):
        return line
    open_end = m.find(">")
    if open_end == -1:
        return line
    prefix = m[: open_end + 1]
    suffix = "</text>"
    content = m[open_end + 1 : -len(suffix)]
    if not content or "<" in content:
        return line
    for phrase in PHRASES:
        wrapped = f'<tspan font-weight="700">{phrase}</tspan>'
        if phrase in content and wrapped not in content:
            content = content.replace(phrase, wrapped, 1)
    if content == m[open_end + 1 : -len(suffix)]:
        return line
    return prefix + content + suffix + "\n"


def process_file(path: Path) -> None:
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    out = []
    for i, line in enumerate(lines):
        if line_skipped(i):
            out.append(line)
            continue
        if line.startswith("<text ") and "</text>" in line:
            out.append(process_text_line(line))
        else:
            out.append(line)
    path.write_text("".join(out), encoding="utf-8")


if __name__ == "__main__":
    import sys

    for p in sys.argv[1:]:
        process_file(Path(p))
        print("OK", p)
