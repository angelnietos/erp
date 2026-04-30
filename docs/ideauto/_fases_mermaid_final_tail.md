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
