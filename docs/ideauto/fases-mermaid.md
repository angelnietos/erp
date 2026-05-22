# Mermaid por fase — arquitectura de seguridad (CAE / Azure / Express)

Cada fase incluye **qué cubre**, **controles normativos** cuando aplica, y un **diagrama** autocontenido. Los colores se reutilizan en todos los diagramas:

| Clase | Color (referencia) | Significado |
|--------|--------------------|-------------|
| `g1` / `gDone` | Verde | Hecho o base ya en el proyecto. |
| `g2` / `gMust` | Rojo | Obligatorio (ISO 27001 Anexo A, RGPD 25·32; 33·34 si aplica). |
| `g3` / `gOpt` | Amarillo | Opcional o fase posterior. |
| `g4` / `gRec` | Naranja | Muy recomendable (casi obligatorio en PII/auditoría dura). |
| `gn` / `gNeutral` | Gris | Título o contenedor neutral. |

**Nota:** No hay *agente* de IA, MLOps ni puntuación de riesgo por **modelo entrenable** en el camino de *enforcement* (permitir / denegar / enmascarar / step-up). Sustituido por un **decision engine** determinista (reglas, umbrales, `ruleId`, `policyVersion` en A.8.15).

---

## Por qué la IA / ML no es aceptable en el camino de *enforcement* (ISO y auditoría real)

Un ISMS sólido y un auditor con criterio técnico pedirán **reproducibilidad**, **criterio versionado** y **explicación completa** de cada decisión que afecta a acceso, datos o export. En ese tramo, un motor basado en **IA/ML** plantea con frecuencia problemas que un **rule engine** o **suma de pesos fijados y documentados** no tiene:

| Problema frecuente (IA/ML en enforce) | Efecto frente a auditoría o incidente |
|--------------------------------------|----------------------------------------|
| Salida no rigurosamente *bit a bit* con la “misma entrada de negocio” (latencia, variación, umbral de modelo) | Difícil probar *exactamente* qué regla o valor se aplicó. |
| El “criterio” cambia con **reentrenamiento** o con versión de modelo | **No** equivale a *policy v2.3* en lenguaje de **A.8.15**. |
| Caja de decisión difícil de reconstituir (pesos, datos, sesgos) | *Why was this blocked?* a menudo no es 100% exigible sin diccionario de entrenamiento y *bias review*. |
| *Version* del producto = artefacto de **modelo** | No sustituye **versión de reglas de negocio** y **hilo a eventos** en un SIEM. |
| Forense bajo plazos (33/34) | Más riesgo de no cerrar con **hecho + criterio + traza** con la claridad de una **regla R12**. |

**Lo que sí conviene a ISO/forense / RGPD 32 “medidas técnicas” (sin renunciar a criterio de negocio):**

- **Misma versión de política + misma señal de contexto** → **misma decisión** (diseño determinista).
- **Versión** publicada: `policyVersion`, set de `ruleId` y, si aplica, **fórmula fija** del score 0–100 (p. ej. *40+30+20+10* = suma de términos aprobada por el responsable de riesgo).
- **Cada** denegación / step-up / límite de export: **id de regla y versión** en el **registro de eventos (A.8.15)**.

### Qué se elimina de la arquitectura “tipo agente / ML” y qué lo sustituye

| Eliminar (no en el *control path* de seguridad) | Sustituto |
|--------------------------------------------------|------------|
| *AI risk engine* / *agent* que decide *allow/deny* | **Decision engine determinista** (servicio de políticas) |
| **MLOps** (entrenar, desplegar y versionar *model* para riesgo) | **Nada** en riesgo operativo de acceso. Opcional: MLOps **fuera** del *enforcement* (p. ej. pronóstico de negocio). |
| *Risk score* por inferencia de modelo | **0–100** = **suma o matriz fija** acordada y trazable (misma entrada, misma salida). |
| Explicar bloqueo solo con “el modelo” | Cada acción: **código de regla + `policyVersion`** en log |

### Cómo queda la “inteligencia” aceptable (reglas avanzadas, no IA de caja negra)

**Sí a:** reglas **ponderadas**, **matriz de riesgo predefinida**, lógica **booleana** y **umbrales fijos** (todo versionado, revisable en comité y en *pull request* de política).  
**No a:** agente, modelo entrenable en línea, ni puntuación que el auditor no pueda replicar a mano con un Excel y la señal capturada.

**Ejemplo fijo (ilustrativo, no cifra de contrato):**  
`40` (desajuste rol) + `30` (dispositivo/MDM desconocido) + `20` (endpoint con datos de alta sensibilidad) + `10` (geo fuera de matriz) → *score*; política de *thresholds* documentada: p. ej. *score > 70* → *DENY*; *40–70* → *STEP-UP MFA*; *< 40* → *ALLOW* (además de RBAC/DLP, etc.).

Esto es **auditable**, **determinista** y alineable con exigencia de trazas **A.8.15** y con **gestión de riesgos (Anexo A)**, sin confundir “*machine learning*” con “*security policy*”.

### Conclusión operativa

- En **seguridad y datos** de CAE, **no** debe existir un **agente IA** que imponga *allow/deny* o enmascaramiento si se pretende un **cierre ISO/RGPD defendible**.
- Sí: **Decision engine** con reglas, umbrales y *policyVersion* en **registro inmutable o append-only cifrado según diseño (A.8.15 + A.8.16 y controles A.5.x de acceso, según diseño)**.
- **Cualquier uso de IA/ML** que el negocio quiera en el futuro debe quedar en **canales no bloqueantes** (analítica, *insights*, *copilot* sin *write* a políticas) y **nunca** como *last word* sobre *export*, *delete* o *access* sin mapeo a regla escrita y versionada.

---

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

## Mermaid final — vista completa (sin agente, sin ML / MLOps)

Diagrama **único** alineado con la sección *Por qué la IA no es aceptable en el camino de enforcement*: el **decision engine** es **100 % determinista** (reglas ponderadas, puntuación 0–100 por suma fija, umbrales versionados, `ruleId` y `policyVersion` en auditoría). **No** hay *AI risk engine*, **no** hay MLOps, **no** hay agente. La caja *Analítica (solo lectura)* es **opcional** y **no** interviene en allow/deny.

```mermaid
---
config:
  layout: elk
---
flowchart TB

  subgraph LEGEND["Leyenda (propuesta al cliente)"]
    L1["Hecho / en marcha hoy (mantener)"]
    L2["Obligatorio: ISO 27001 Anexo A + RGPD 25·32 (y 33·34 si aplica)"]
    L3["Opcional o fase 2+"]
    L4["Muy recomendable: PII/DA fuerte o auditoría dura"]
  end
  class L1 gDone
  class L2 gMust
  class L3 gOpt
  class L4 gRec

  TITLE["<b>CAE / datos personales y económicos</b><br/>Cifrado · mínima exposición · trazas · SDLC seguro<br/><i>Decision engine determinista. Sin agente. Sin MLOps.</i>"]
  class TITLE gNeutral

  subgraph LEGAL["Contexto (negocio)"]
    RGPD["<b>RGPD</b> art. 25 · 32 · 33-34 (si aplica)"]
  end
  class RGPD gMust

  subgraph USER["Usuarios, dispositivo, sesión"]
    U["Usuario: web / móvil / API"]
    DVC["Postura de dispositivo (compliance)"]
    SESS["Sesión / revocación / tiempo de vida"]
  end
  class U gDone
  class DVC,SESS gRec

  subgraph EDGE["Perímetro (Internet → aplicación)"]
    FE["Frontend: TLS, cookies, CSRF según diseño"]
    AFD["Azure Front Door"]
    WAF["WAF OWASP"]
    DDOS["DDoS"]
    BOT["Protección bot / abuse (si aplica)"]
  end
  class FE gDone
  class AFD,WAF,DDOS gMust
  class BOT gOpt

  subgraph IDENTITY["Identidad (Entra)"]
    ENTRA["Microsoft Entra ID (IdP)"]
    MFA["MFA (accesos sensibles)"]
    CA["Conditional Access"]
    PIM["PIM o equivalente (privilegiados)"]
    IDRISK["Riesgo inicio de sesión (IdP)"]
    JWT["JWT: issuer, aud, validez, rotación"]
  end
  class ENTRA,MFA,CA,IDRISK,JWT gRec
  class PIM gMust

  subgraph API["API Express (punto único)"]
    GWAY["Gateway Express"]
    RATE["Rate limit + anti-abuse"]
    AUTHZ["AuthN: valida JWT"]
    AUTHR["RBAC / ABAC"]
    VALI["Validación de entrada"]
    CORS["CORS + headers"]
  end
  class GWAY,RATE,AUTHZ,AUTHR,VALI gDone
  class CORS gRec

  subgraph DLP["A.8.12 Prevención de fuga (app)"]
    PAG["Paginación + topes (no listados masivos)"]
    EXP["Control export CSV/PDF, aprobación, registro"]
    SAMP["Datos prueba anonimizados (no PII en dev/test)"]
    BULK["Patrones: volumen, frecuencia (reglas)"]
  end
  class PAG,EXP,SAMP,BULK gMust

  subgraph DE["<b>Decision engine determinista</b> (sin agente, sin ML)"]
    CTX["<b>Contexto</b>: señales para esta petición"]
    WRE["<b>Reglas ponderadas</b> + matriz fija + lógica booleana<br/>policy vX.Y versionable en log"]
    RSC["<b>Puntuación 0–100</b>: suma de pesos fijos (rol, dispositivo, sensibilidad, geo…)"]
    THR["<b>Umbrales fijos</b> (doc. de política): ej. score alto → DENY; medio → STEP-UP; bajo → ALLOW"]
    DCN["<b>Decisión</b> + ruleId + policyVersion → A.8.15"]
  end
  class CTX,WRE,RSC,THR,DCN gRec

  subgraph DOMAIN["Dominio"]
    APS["Application services"]
    BIZ["Lógica de negocio"]
    DMR["Reglas dominio + dato en claro solo si procede"]
  end
  class APS,BIZ gDone
  class DMR gRec

  subgraph SENS["A.8.11 Enmascaramiento (runtime)"]
    MRUN["Enmascaramiento en UI / DTO"]
    MREP["Reporting vistas o rol restringido"]
  end
  class MRUN,MREP gMust

  subgraph DAL2["DAL + logs app"]
    DALY["Repositorio, SQL parametrizado"]
    STRLOG["Logs estructurados, request-id, sin PII de más"]
  end
  class DALY,STRLOG gRec

  subgraph DBSG["A.8.10 / A.8.24 Base de datos"]
    SQL[("Azure SQL / SQL Server")]
    TDE["TDE (reposo)"]
    CLE["Always Encrypted (alto riesgo)"]
    TLS13["TLS cliente → servidor BD"]
    DDM["Dynamic Data Masking"]
    RLSN["Row Level Security"]
    BENCR["Backups cifrados + retención"]
    SQLAUD["Auditoría de motor (SQL/Threat)"]
  end
  class TDE,TLS13,DDM,RLSN,BENCR,SQLAUD gMust
  class CLE gRec
  class SQL gNeutral

  subgraph KEYS["A.8.24 Claves y secretos"]
    MI["Managed Identities"]
    AKV["Key Vault: secretos, claves, cert, rotación"]
    HSMK["HSM (Premium) según riesgo"]
  end
  class MI,AKV gMust
  class HSMK gRec

  subgraph AUDF["A.8.15-16 Eventos, correlación, evidencia"]
    EVT["Canal de eventos unificado"]
    CORR["Correlación (usuario, ventana, entidad)"]
    IMM["WORM lógico o append-only cifrado"]
    EVD2["Evidencia para 33-34 / auditor"]
  end
  class EVT gMust
  class CORR,IMM,EVD2 gRec

  subgraph MONSG["A.8.16 Monitorización"]
    AINS["App Insights / OpenTelemetry"]
    AMON["Monitor + alertas"]
    LAW["Log Analytics"]
    SEN["Microsoft Sentinel (SIEM)"]
    UEBA["UEBA (opc. producto)"]
  end
  class AINS,AMON,LAW,SEN gMust
  class UEBA gOpt

  SOAR["SOAR / playbooks (muy recomendable)"]
  class SOAR gRec

  subgraph ANLY["Solo lectura: analítica (fuera de enforcement)"]
    BI["KPIs, informes agregados: no afecta allow/deny"]
  end
  class ANLY,BI gOpt

  subgraph SDLC["A.8.25 SDLC + suministro"]
    REPO["Git, ramas, code review"]
    SAST["SAST + secretos en PR"]
    SCA["SCA + SBOM (según alcance)"]
    BUILD["Build reproducible"]
    IAC2["IaC, revisión, drift"]
    DEP["Despliegue dev / stage / prod"]
  end
  class REPO,BUILD,DEP gDone
  class SAST,SCA,IAC2 gMust

  subgraph CNT["Contenerización (si aplica)"]
    CIMG["Imagen mínima, parches"]
    CSCAN["Escaneo de imagen (CVE)"]
  end
  class CIMG,CSCAN gRec

  subgraph SECP["Secretos: no en Git"]
    SINJ["Pipeline → Key Vault; runtime con MI"]
  end
  class SINJ gMust

  U --> DVC --> SESS --> FE --> AFD --> WAF --> DDOS
  BOT --> GWAY
  U --> ENTRA
  ENTRA --> MFA --> CA --> IDRISK --> JWT
  PIM -.-> ENTRA

  WAF --> GWAY --> RATE --> AUTHZ --> AUTHR --> VALI --> CORS
  AUTHZ --> JWT
  CORS --> CTX
  DVC --> CTX
  IDRISK --> CTX
  JWT --> CTX
  AUTHR --> CTX
  GWAY --> CTX
  CTX --> WRE --> RSC --> THR --> DCN

  DCN -->|permitir / acotar| APS
  DCN -->|deny| GWAY
  DCN -->|step-up| MFA
  DCN -->|mascar| MRUN

  GWAY --> PAG
  APS --> EXP
  APS --> BULK
  BIZ --> DALY
  BIZ --> MRUN
  BIZ --> MREP
  BIZ --> STRLOG
  DALY --> SAMP
  DALY --> SQL
  SQL --> TDE
  SQL --> CLE
  SQL --> DDM
  SQL --> RLSN
  SQL --> BENCR
  SQL --> SQLAUD
  MI --> SQL
  MI --> AKV
  AKV --> TDE
  CLE --> HSMK
  MREP --> DDM
  DALY --> RLSN

  GWAY --> EVT
  AUTHR --> EVT
  EXP --> EVT
  THR --> EVT
  DCN --> EVT
  DALY --> EVT
  SQL --> EVT
  EVT --> CORR
  CORR --> AINS
  AINS --> AMON
  AMON --> SEN
  SEN --> UEBA
  SEN --> SOAR
  SEN --> LAW
  CORR --> IMM
  IMM --> EVD2
  EVD2 --> RGPD
  LAW -.->|solo lectura| BI

  REPO --> SAST
  SAST --> SCA
  SCA --> BUILD
  BUILD --> CIMG
  CIMG --> CSCAN
  SCA --> SINJ
  SINJ --> AKV
  BUILD --> SINJ
  BUILD --> IAC2
  IAC2 --> DEP
  CSCAN --> DEP
  DEP --> FE
  DEP --> GWAY
  DEP --> SQL

  APS --> GWAY
  GWAY --> FE --> U

  classDef gDone fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20,stroke-width:2px
  classDef gMust fill:#ffebee,stroke:#b71c1c,color:#8b0000,stroke-width:2px
  classDef gOpt  fill:#fff8e1,stroke:#f9a825,color:#6d4c41,stroke-width:1px
  classDef gRec  fill:#ffe0b2,stroke:#e65100,color:#bf360c,stroke-width:2px
  classDef gNeutral fill:#f5f5f5,stroke:#9e9e9e,color:#424242,stroke-width:1px
```
