## Fase 0 — Leyenda y ámbito

**Qué es:** marco de lectura común para propuesta y revisiones técnicas. Deja claro qué se considera “ya hecho”, qué es **obligatorio** para reducir el riesgo legal/técnico, y qué es **complementario**.

**Alcance de la solución (texto):** plataforma que trata **datos personales y económicos** (CAE), con almacenamiento en **Azure SQL / SQL Server**, API **Express**, identidad **Microsoft Entra ID** y trazas en ecosistema **Azure**.

```mermaid
flowchart TB
  subgraph L["Leyenda de prioridad"]
    L1["Hecho / base en proyecto"]
    L2["Obligatorio: ISO + RGPD (cifrado, trazas, mínima exposición, SDLC)"]
    L3["Opcional o fase posterior"]
    L4["Muy recomendable: PII duro, forense, claves de alto impacto"]
  end
  T["Ámbito: CAE — riesgo SOLO determinista · sin MLOps/IA en enforcement"]
  T --- L
  class L1 g1
  class L2 g2
  class L3 g3
  class L4 g4
  class T gn
  classDef g1 fill:#e8f5e9,stroke:#2e7d32,color:#0d3b0d,stroke-width:2px
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
  classDef g3 fill:#fff8e1,stroke:#f9a825,color:#4a3c00,stroke-width:1px
  classDef g4 fill:#ffe0b2,stroke:#e65100,color:#3e1a00,stroke-width:2px
  classDef gn fill:#f5f5f5,stroke:#9e9e9e,color:#212121,stroke-width:1px
```

---

## Fase 1 — Usuarios y dispositivo

**Qué es:** quién accede (web, móvil, API) y qué **señal** aporta el dispositivo o el IdP (postura, cumplimiento) para alimentar **Conditional Access** y el **contexto** del *decision engine* (sin ML).

**Normativa:** mínimo privilegio; acceso condicionado al contexto (A.5 / A.8, según diseño).

```mermaid
flowchart LR
  U["Usuarios: web, móvil, cliente API"] --> DVC["Señal dispositivo / postura (Entra)"]
  class U g1
  class DVC g4
  classDef g1 fill:#e8f5e9,stroke:#2e7d32,color:#0d3b0d,stroke-width:2px
  classDef g4 fill:#ffe0b2,stroke:#e65100,color:#3e1a00,stroke-width:2px
```

---

## Fase 2 — Perímetro (borde)

**Qué es:** tráfico Internet → aplicación. **TLS**, **Front Door**, **WAF** (OWASP), **DDoS**, y **protección de abusos/bots** si el riesgo lo justifica (opcional; no sustituye cifrado en datos ni A.8.15).

**Normativa:** refuerza **A.8** (canal de exposición).

```mermaid
flowchart LR
  FE["Frontend: TLS, sesión, cookies"] --> AFD["Azure Front Door"]
  AFD --> WAF["WAF OWASP"]
  WAF --> DD["DDoS"]
  DD --> BT["Abuso / bot (si aplica)"]
  class FE g1
  class AFD,WAF,DD g2
  class BT g3
  classDef g1 fill:#e8f5e9,stroke:#2e7d32,color:#0d3b0d,stroke-width:2px
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
  classDef g3 fill:#fff8e1,stroke:#f9a825,color:#4a3c00,stroke-width:1px
```

---

## Fase 3 — Identidad (Microsoft Entra ID)

**Qué es:** IdP, **MFA**, **Conditional Access**, riesgo de inicio de sesión, **PIM** o equivalente para administración, **tokens JWT** con parámetros acordados (issuer, aud, validez).

**Normativa:** A.5.15–A.5.18 (acceso) y A.8.2 / A.8.3 en la práctica.

```mermaid
flowchart TB
  EID["Entra ID: IdP"] --> MFA["MFA"]
  MFA --> CA["Conditional Access"]
  CA --> RSKS["Riesgo inicio de sesión / IdP"]
  PIM["PIM o equivalente (privilegiados)"] --> EID
  RSKS --> JWT["JWT: validez, emisor, audiencia, política"]
  class PIM g2
  class EID,MFA,CA,RSKS,JWT g4
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
  classDef g4 fill:#ffe0b2,stroke:#e65100,color:#3e1a00,stroke-width:2px
```

---

## Fase 4 — API (Express) — capa de política en el servicio

**Qué es:** **gateway** como punto único de **rate limit**, autenticación, **RBAC/ABAC** y **validación** (sin pasar a dominio con entrada dudosa).

**Normativa:** A.8.25 y apoyo a A.8.12 (abuso).

```mermaid
flowchart TB
  GWAY["API gateway Express"] --> RLIM["Rate limit: IP, usuario, ruta"]
  RLIM --> AUTHM["Auth: valida JWT y claims"]
  AUTHM --> RBAC["Autorización RBAC/ABAC"]
  RBAC --> VALD["Validación esquemas, anti inyección"]
  class GWAY,RLIM,AUTHM,RBAC,VALD g1
  classDef g1 fill:#e8f5e9,stroke:#2e7d32,color:#0d3b0d,stroke-width:2px
```

---

## Fase 5 — DLP en aplicación (A.8.12)

**Qué es:** listados con **paginación y topes**, **export** con aprobación y registro, entornos **sin PII reales** en pruebas, y **reglas** para picos o patrones (volumen, frecuencia) — *sin* modelo entrenable.

**Normativa:** A.8.12.

```mermaid
flowchart TB
  PAG["Listados: paginación, volcado acotado"]
  EXPX["Export: cuotas, registro, aprobación"]
  TDATA["Dev/test: datos anónimos o sintéticos"]
  ABN["Reglas: picos, frecuencia, umbrales fijos"]
  PAG ~~~ EXPX
  TDATA ~~~ ABN
  class PAG,EXPX,TDATA,ABN g2
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
```

---

## Fase 6 — Decision engine (determinista; sin agente, sin ML)

**Qué es:** **Contexto** de señales → **reglas ponderadas / matriz** (versionadas) → **puntuación 0–100 opcional** (solo fórmula fija) → **umbrales** → **decisión** (allow, deny, mask, step-up, bloqueo de export) con **ruleId** y **policyVersion** hacia A.8.15.

**Normativa:** riesgo operativo y A.8.15 (no reemplaza A.8.24 cifrado).

```mermaid
flowchart TB
  SIGI["Señales: IdP, roles, ruta, dispositivo, hora"] --> RULE["Motor de reglas versionado"]
  RULE --> RSCR["Score 0–100 opcional: fórmula fija, no entrenable"]
  RSCR --> POLD["Umbrales: DENY / STEP-UP / ALLOW (doc.)"]
  RULE --> POLD
  POLD --> DECK["Decisión + ruleId + policyVersion → log"]
  class SIGI,RULE,POLD,DECK g2
  class RSCR g3
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
  classDef g3 fill:#fff8e1,stroke:#f9a825,color:#4a3c00,stroke-width:1px
```

---

## Fase 7 — Dominio y A.8.11 (mínima exposición)

**Qué es:** lógica de **negocio** y enmascaramiento en DTOs/UI; solo datos en claro estrictamente necesarios.

**Normativa:** A.8.11 y minimización (RGPD).

```mermaid
flowchart TB
  APP["Servicios de aplicación"] --> BZ["Lógica de negocio"]
  BZ --> MRUN["Enmascaramiento: DTO / UI según regla"]
  class APP,BZ g1
  class MRUN g2
  classDef g1 fill:#e8f5e9,stroke:#2e7d32,color:#0d3b0d,stroke-width:2px
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
```

---

## Fase 8 — DAL y trazas de aplicación

**Qué es:** repositorio con **SQL parametrizado**; **logs estructurados** (request-id) sin PII de más en trazas.

**Normativa:** apoyo a A.8.15, A.8.3 a nivel de aplicación.

```mermaid
flowchart TB
  DAL["Repositorio / DAL, SQL con parámetros"] --> LST["Logs estructurados, correlación"]
  class DAL,LST g4
  classDef g4 fill:#ffe0b2,stroke:#e65100,color:#3e1a00,stroke-width:2px
```

---

## Fase 9 — Base de datos (A.8.10, A.8.24, A.8.11 DDM, RLS)

**Qué es:** **TDE**, **TLS** hacia el motor, **RLS**, **DDM**, **backups cifrados**, **auditoría** de motor; **Always Encrypted** u cifrado columnal para columnas de alto riesgo (muy recomendable).

**Normativa:** A.8.10, A.8.24, A.8.11.

```mermaid
flowchart TB
  SQL[("Azure SQL / motor")] --> TDE["TDE"]
  SQL --> TTLS["TLS a servidor BD"]
  SQL --> DDMK["Dynamic Data Masking"]
  SQL --> RLSX["Row Level Security"]
  SQL --> BENC["Backups cifrados + retención"]
  SQL --> QAUD["Auditoría motor"]
  CLE2["Always Encrypted (puntuales)"] --> HSM2["HSM o clave dura si riesgo"]
  SQL --> CLE2
  class SQL gn
  class TDE,TTLS,BENC,QAUD g2
  class DDMK,RLSX g2
  class CLE2,HSM2 g4
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
  classDef g4 fill:#ffe0b2,stroke:#e65100,color:#3e1a00,stroke-width:2px
  classDef gn fill:#f5f5f5,stroke:#9e9e9e,color:#212121,stroke-width:1px
```

---

## Fase 10 — Claves y secretos (A.8.24)

**Qué es:** **Managed Identity**, **Key Vault** (rotación, acceso mínimo); **HSM** si riesgo o norma exige.

**Normativa:** A.8.24 (ciclo de vida de claves).

```mermaid
flowchart LR
  MID["Managed Identity"] --> KV2["Key Vault: secretos, claves, cert, rotación"]
  KV2 --> TDE2["Apoyo a TDE / cifrado servicio: sin claves en Git"]
  HSM2a["HSM: solo si riesgo / norma"] --> KV2
  class MID,KV2 g2
  class HSM2a g4
  class TDE2 g2
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
  classDef g4 fill:#ffe0b2,stroke:#e65100,color:#3e1a00,stroke-width:2px
```

---

## Fase 11 — Registro, correlación y evidencia (A.8.15)

**Qué es:** canal de **eventos** (acceso, poliza, decisiones, export, DML/operaciones acordadas), **correlación** y almacenamiento a prueba de repudio o **append-only** cifrado. Evidencia para 33/34 o auditor.

**Normativa:** A.8.15; base de A.8.16.

```mermaid
flowchart TB
  EVC["Eventos: login, auth, export, admin, operaciones críticas"] --> COR2["Correlación"]
  COR2 --> IMM2["Inmutabilidad o WORM lógica, retención cifrada"]
  IMM2 --> EVD["Evidencia: informes, incidente, paquetes"]
  class EVC g2
  class COR2,IMM2 g4
  class EVD g2
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
  classDef g4 fill:#ffe0b2,stroke:#e65100,color:#3e1a00,stroke-width:2px
```

---

## Fase 12 — Monitorización, SIEM (A.8.16)

**Qué es:** **Application Insights** / **OpenTelemetry**, **Monitor**, **Log Analytics**, **Sentinel**; **UEBA** opcional; **SOAR** naranja (muy recomendable).

**Normativa:** A.8.16; la periodicidad y el alcance van en **política operativa**.

```mermaid
flowchart TB
  EVC2["Eventos hacia plataforma"] --> AINS2["App Insights / OTel"]
  AINS2 --> AMON["Monitor: alertas, umbrales"]
  AMON --> LWA["Log Analytics"]
  LWA --> SEN2["Sentinel (si se adopta)"]
  SEN2 --> UEB2["UEBA (opt.)"]
  SEN2 --> SOR2["SOAR: playbooks (muy rec.)"]
  class EVC2,AINS2,AMON,LWA,SEN2 g2
  class UEB2 g3
  class SOR2 g4
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
  classDef g3 fill:#fff8e1,stroke:#f9a825,color:#4a3c00,stroke-width:1px
  classDef g4 fill:#ffe0b2,stroke:#e65100,color:#3e1a00,stroke-width:2px
```

---

## Fase 13 — SDLC, contenedores y despliegue (A.8.25 + suministro)

**Qué es:** repositorio con **revisión**; **SAST** y búsqueda de **secretos** en PR; **SCA** (CVE) y **SBOM** según criterio; **IaC**; **canales** dev/pre/prod. Contenedores: imágenes mínimas, **escaneo de imagen** (naranja, muy recomendable). **Secretos** solo vía **pipeline a Key Vault**; runtime con **identidades** — nunca claves en Git.

**Normativa:** A.8.25; cadena de suministro 8.2x según acuerdo.

```mermaid
flowchart TB
  GIT2["Ramas, code review, aprobación a prod"] --> SAST2["SAST + secretos en PR"]
  SAST2 --> SCA2["SCA, SBOM según criterio"]
  SCA2 --> BLD2["Build atribuible a commit"]
  BLD2 --> IAC2["IaC desplegado de forma trazable"]
  BLD2 --> IMGB["Imágenes: mínimas, parcho (si aplica)"]
  IMGB --> SCIM["Escáner de imagen (si aplica)"]
  SINJ2["Inyección a Key Vault, MI en runtime"] --> DEP2["Despliegue por entorno"]
  IAC2 --> DEP2
  SCA2 --> SINJ2
  BLD2 --> SINJ2
  SCIM --> DEP2
  SINJ2 --> DEP2
  class GIT2,BLD2,DEP2 g1
  class SAST2,SCA2,IAC2 g2
  class IMGB,SCIM g4
  class SINJ2 g2
  classDef g1 fill:#e8f5e9,stroke:#2e7d32,color:#0d3b0d,stroke-width:2px
  classDef g2 fill:#ffebee,stroke:#c62828,color:#3e0000,stroke-width:2px
  classDef g4 fill:#ffe0b2,stroke:#e65100,color:#3e1a00,stroke-width:2px
```

---
