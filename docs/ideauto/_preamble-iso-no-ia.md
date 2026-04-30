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