TD A[User Upload Document] --> B[API Management + Azure AD] B --> C[FastAPI Backend] C --> D{Queue Decision} D -->|Fast Path| E[Redis Queue] D -->|Durable Path| F[Azure Service Bus] E --> G[Azure Functions Orchestrator] F --> G G --> H[Normalization Layer] H --> I[Routing Agent GPT-4o mini] I -->|PDF Text| J1[PDF Parser] I -->|Image Clean| J2[Azure Document Intelligence] I -->|Complex Image| J3[GPT-4o Vision] J1 --> K[Raw Text] J2 --> K J3 --> K K --> L[Document Classifier GPT-4o mini] L --> M{CAE Document Type} M --> M1[ITV Extractor] M --> M2[Insurance Extractor] M --> M3[PRL Extractor] M --> M4[ADR Extractor] M --> M5[Other Extractors] M1 --> N[Structured JSON] M2 --> N M3 --> N M4 --> N M5 --> N N --> O[Rules Engine Python] O --> P[Semantic Validator GPT-4o mini] P --> Q[Risk Scoring Engine] Q --> R{Decision} R -->|GREEN| S[Approved] R -->|AMBER| T[Human Review Queue Redis] R -->|RED| U[Blocked] T --> V[HITL Interface] V --> W[Gold Dataset Data Lake] W --> X[Feedback Loop Optimization] X --> I S --> Y[Cosmos DB Audit Log] U --> Y T --> Y necesito que mejores mi arquitectura la expliques con detalle y la guardes en un nuevo documento md 🏗️ FASE 1 — INGESTA Y GESTIÓN DE TRÁFICO (ENTRYPOINT) 1. API MANAGEMENT + AZURE AD 🔧 Qué hace Es la puerta de entrada al sistema: valida autenticación (Azure AD) aplica rate limiting (ej: 100 requests/min) protege contra abuso o ataques 🧠 Por qué existe Si no lo tienes: cualquier script puede dispararte costes de IA no puedes auditar quién subió qué documento no hay control de acceso 💰 Impacto en coste 👉 evita costes descontrolados (crítico en IA) ⚖️ Impacto legal 👉 permite trazabilidad de usuario (quién sube documento) 2. FASTAPI BACKEND 🔧 Qué hace recibe archivo genera document_id sube a Blob Storage (RAW) no procesa nada pesado 🧠 Por qué FastAPI async → maneja muchas peticiones sin bloquear rápido → bajo coste computacional ideal para I/O (subida de archivos) ⚠️ Decisión clave 👉 el backend NO procesa IA 👉 solo enruta 3. DECISIÓN DE COLA (REDIS vs SERVICE BUS) 🔧 Qué hace Decide cómo se va a procesar el documento. 🟢 Redis (FAST PATH) Uso: respuesta en tiempo real (usuario esperando) baja latencia Funciones: cola rápida cache deduplicación 🟡 Service Bus (DURABLE PATH) Uso: cargas masivas procesos batch Funciones: persistencia garantizada reintentos automáticos tolerancia a fallos 🧠 Por qué esta dualidad 👉 Redis = velocidad 👉 Service Bus = fiabilidad Sin esto: o eres rápido pero frágil o robusto pero lento 🧠 FASE 2 — CAPA DE INTELIGENCIA 4. NORMALIZATION LAYER 🔧 Qué hace Convierte cualquier documento en formato estándar. Procesos: PDF → imágenes (300 DPI) HEIC → JPG/PNG deskew (enderezado) limpieza visual 🧠 Por qué es crítico La IA depende de calidad de entrada: basura entra → basura sale 💰 Impacto 👉 mejora OCR → menos fallback caro (GPT-4o Vision) 5. ROUTING AGENT (GPT-4o MINI) 🔧 Qué hace Decide la ruta de procesamiento más barata posible Opciones: PDF con texto → parser imagen clara → OCR imagen mala → multimodal 🧠 Por qué es clave Sin esto: 👉 todo pasaría por GPT-4o Vision (carísimo) 💰 Impacto 👉 aquí está el mayor ahorro del sistema 6. EXTRACCIÓN BASE (3 CAMINOS) 🟢 A. PDF PARSER PyMuPDF coste ≈ 0 precisión máxima 🟡 B. OCR (Document Intelligence) estándar industrial bueno para documentos estructurados 🔴 C. GPT-4o Vision fallback solo casos difíciles 🧠 Diseño correcto 👉 primero barato 👉 luego caro solo si falla 7. CLASIFICADOR DOCUMENTAL 🔧 Qué hace Determina el tipo de documento CAE 🧠 Por qué es crítico Cada documento tiene reglas distintas: ITV → fechas Seguro → cobertura PRL → certificados 👉 sin esto: errores de lógica graves 8. EXTRACTORES ESPECIALIZADOS 🔧 Qué hacen Transforman texto → JSON estructurado Ejemplo: { "plate": "1234ABC", "expiry_date": "2026-10-10" } 🧠 Por qué funcionan mejor contexto pequeño tarea concreta menos errores 💰 Impacto 👉 menos tokens → más barato ⚖️ FASE 3 — COMPLIANCE (LA PARTE IMPORTANTE) 9. RULES ENGINE (PYTHON) 🔧 Qué hace Aplica normativa legal Ejemplo: if expiry_date < today: reject() 🧠 Regla clave la IA nunca toma decisiones legales ⚖️ Por qué es crítico Porque necesitas justificar: “rechazado por X regla” 10. VALIDACIÓN SEMÁNTICA (IA) 🔧 Qué hace Detecta problemas que reglas no ven: incoherencias fraude errores OCR Ejemplo: fecha válida pero visualmente manipulada 🧠 Por qué existe 👉 reglas ≠ inteligencia contextual 11. RISK ENGINE 🔧 Qué hace Unifica todo en un score Resultado: nivel acción GREEN aprobar AMBER revisar RED bloquear 🧠 Por qué es clave 👉 convierte sistema complejo en decisión simple 👤 FASE 4 — HUMAN-IN-THE-LOOP 12. HITL INTERFACE 🔧 Qué hace El humano corrige solo casos dudosos Flujo: ve documento ve JSON corrige 🧠 Por qué es crítico 👉 evita errores en producción 👉 crea dataset real 📂 FASE 5 — DATOS Y AUDITORÍA 13. DATA ARCHITECTURE Bronze documento original Silver OCR + JSON IA Gold validado humano 14. AUDITORÍA (COSMOS DB) 🔧 Qué guarda input output IA reglas ejecutadas decisión final timestamps ⚖️ Por qué es crítico 👉 inspección laboral 👉 trazabilidad completa 🔁 FASE 6 — FEEDBACK LOOP 15. MEJORA CONTINUA 🔧 Qué hace Usa errores humanos para mejorar: prompts routing extractores 🧠 Resultado 👉 cada mes menos revisión manual 💡 QUÉ HAS CONSTRUIDO REALMENTE No es un sistema de OCR. Es un sistema de: ⚖️ decisión legal automatizada con trazabilidad total 🚀 RESUMEN FINAL (CLAVE DE TODO) Tu sistema funciona porque: ✔ IA interpreta ✔ reglas deciden ✔ humano corrige excepciones ✔ datos mejoran el sistema
graph TD

A[User Upload Document] --> B[API Management + Azure AD]

B --> C[FastAPI Backend]

C --> D{Queue Decision}

D -->|Fast Path| E[Redis Queue]
D -->|Durable Path| F[Azure Service Bus]

E --> G[Azure Functions Orchestrator]
F --> G

G --> H[Normalization Layer]

H --> I[Routing Agent GPT-4o mini]

I -->|PDF Text| J1[PDF Parser]
I -->|Image Clean| J2[Azure Document Intelligence]
I -->|Complex Image| J3[GPT-4o Vision]

J1 --> K[Raw Text]
J2 --> K
J3 --> K

K --> L[Document Classifier GPT-4o mini]

L --> M{CAE Document Type}

M --> M1[ITV Extractor]
M --> M2[Insurance Extractor]
M --> M3[PRL Extractor]
M --> M4[ADR Extractor]
M --> M5[Other Extractors]

M1 --> N[Structured JSON]
M2 --> N
M3 --> N
M4 --> N
M5 --> N

N --> O[Rules Engine Python]

O --> P[Semantic Validator GPT-4o mini]

P --> Q[Risk Scoring Engine]

Q --> R{Decision}

R -->|GREEN| S[Approved]
R -->|AMBER| T[Human Review Queue Redis]
R -->|RED| U[Blocked]

T --> V[HITL Interface]

V --> W[Gold Dataset Data Lake]

W --> X[Feedback Loop Optimization]

X --> I

S --> Y[Cosmos DB Audit Log]
U --> Y
T --> Y

necesito que mejores mi arquitectura la expliques con detalle y la guardes en un nuevo documento md

🏗️ FASE 1 — INGESTA Y GESTIÓN DE TRÁFICO (ENTRYPOINT)

1. API MANAGEMENT + AZURE AD
   🔧 Qué hace

Es la puerta de entrada al sistema:

valida autenticación (Azure AD)
aplica rate limiting (ej: 100 requests/min)
protege contra abuso o ataques
🧠 Por qué existe

Si no lo tienes:

cualquier script puede dispararte costes de IA
no puedes auditar quién subió qué documento
no hay control de acceso
💰 Impacto en coste

👉 evita costes descontrolados (crítico en IA)

⚖️ Impacto legal

👉 permite trazabilidad de usuario (quién sube documento)

2. FASTAPI BACKEND
   🔧 Qué hace
   recibe archivo
   genera document_id
   sube a Blob Storage (RAW)
   no procesa nada pesado
   🧠 Por qué FastAPI
   async → maneja muchas peticiones sin bloquear
   rápido → bajo coste computacional
   ideal para I/O (subida de archivos)
   ⚠️ Decisión clave

👉 el backend NO procesa IA
👉 solo enruta

3. DECISIÓN DE COLA (REDIS vs SERVICE BUS)
   🔧 Qué hace

Decide cómo se va a procesar el documento.

🟢 Redis (FAST PATH)
Uso:
respuesta en tiempo real (usuario esperando)
baja latencia
Funciones:
cola rápida
cache
deduplicación
🟡 Service Bus (DURABLE PATH)
Uso:
cargas masivas
procesos batch
Funciones:
persistencia garantizada
reintentos automáticos
tolerancia a fallos
🧠 Por qué esta dualidad

👉 Redis = velocidad
👉 Service Bus = fiabilidad

Sin esto:

o eres rápido pero frágil
o robusto pero lento
🧠 FASE 2 — CAPA DE INTELIGENCIA 4. NORMALIZATION LAYER
🔧 Qué hace

Convierte cualquier documento en formato estándar.

Procesos:
PDF → imágenes (300 DPI)
HEIC → JPG/PNG
deskew (enderezado)
limpieza visual
🧠 Por qué es crítico

La IA depende de calidad de entrada:

basura entra → basura sale

💰 Impacto

👉 mejora OCR → menos fallback caro (GPT-4o Vision)

5. ROUTING AGENT (GPT-4o MINI)
   🔧 Qué hace

Decide la ruta de procesamiento más barata posible

Opciones:
PDF con texto → parser
imagen clara → OCR
imagen mala → multimodal
🧠 Por qué es clave

Sin esto:

👉 todo pasaría por GPT-4o Vision (carísimo)

💰 Impacto

👉 aquí está el mayor ahorro del sistema

6. EXTRACCIÓN BASE (3 CAMINOS)
   🟢 A. PDF PARSER
   PyMuPDF
   coste ≈ 0
   precisión máxima
   🟡 B. OCR (Document Intelligence)
   estándar industrial
   bueno para documentos estructurados
   🔴 C. GPT-4o Vision
   fallback
   solo casos difíciles
   🧠 Diseño correcto

👉 primero barato
👉 luego caro solo si falla

7. CLASIFICADOR DOCUMENTAL
   🔧 Qué hace

Determina el tipo de documento CAE

🧠 Por qué es crítico

Cada documento tiene reglas distintas:

ITV → fechas
Seguro → cobertura
PRL → certificados

👉 sin esto:

errores de lógica graves 8. EXTRACTORES ESPECIALIZADOS
🔧 Qué hacen

Transforman texto → JSON estructurado

Ejemplo:
{
"plate": "1234ABC",
"expiry_date": "2026-10-10"
}
🧠 Por qué funcionan mejor
contexto pequeño
tarea concreta
menos errores
💰 Impacto

👉 menos tokens → más barato

⚖️ FASE 3 — COMPLIANCE (LA PARTE IMPORTANTE) 9. RULES ENGINE (PYTHON)
🔧 Qué hace

Aplica normativa legal

Ejemplo:
if expiry_date < today:
reject()
🧠 Regla clave

la IA nunca toma decisiones legales

⚖️ Por qué es crítico

Porque necesitas justificar:

“rechazado por X regla”

10. VALIDACIÓN SEMÁNTICA (IA)
    🔧 Qué hace

Detecta problemas que reglas no ven:

incoherencias
fraude
errores OCR
Ejemplo:
fecha válida pero visualmente manipulada
🧠 Por qué existe

👉 reglas ≠ inteligencia contextual

11. RISK ENGINE
    🔧 Qué hace

Unifica todo en un score

Resultado:
nivel acción
GREEN aprobar
AMBER revisar
RED bloquear
🧠 Por qué es clave

👉 convierte sistema complejo en decisión simple

👤 FASE 4 — HUMAN-IN-THE-LOOP 12. HITL INTERFACE
🔧 Qué hace

El humano corrige solo casos dudosos

Flujo:
ve documento
ve JSON
corrige
🧠 Por qué es crítico

👉 evita errores en producción
👉 crea dataset real

📂 FASE 5 — DATOS Y AUDITORÍA 13. DATA ARCHITECTURE
Bronze
documento original
Silver
OCR + JSON IA
Gold
validado humano 14. AUDITORÍA (COSMOS DB)
🔧 Qué guarda
input
output IA
reglas ejecutadas
decisión final
timestamps
⚖️ Por qué es crítico

👉 inspección laboral
👉 trazabilidad completa

🔁 FASE 6 — FEEDBACK LOOP 15. MEJORA CONTINUA
🔧 Qué hace

Usa errores humanos para mejorar:

prompts
routing
extractores
🧠 Resultado

👉 cada mes menos revisión manual

💡 QUÉ HAS CONSTRUIDO REALMENTE

No es un sistema de OCR.

Es un sistema de:

⚖️ decisión legal automatizada con trazabilidad total

🚀 RESUMEN FINAL (CLAVE DE TODO)

Tu sistema funciona porque:

✔ IA interpreta
✔ reglas deciden
✔ humano corrige excepciones
✔ datos mejoran el sistema
