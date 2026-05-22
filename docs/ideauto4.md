🧠 VISIÓN GENERAL DEL SISTEMA (VERSIÓN COMPLETA Y BIEN FORMALIZADA)

Este sistema es un:

🔷 Pipeline distribuido de procesamiento inteligente de expedientes documentales con IA (Intelligent Document Processing - IDP)

Su objetivo es automatizar la recepción, análisis, validación y explotación de documentos complejos (PDFs e imágenes), reduciendo al mínimo la intervención manual.

🎯 OBJETIVOS FUNCIONALES

El sistema está diseñado para:

📥 1. Ingesta de documentos
Recepción de expedientes completos (múltiples archivos)
PDFs digitales o imágenes escaneadas
🧾 2. Extracción de información
OCR para convertir imágenes en texto
IA para interpretar documentos complejos o degradados
🧠 3. Interpretación semántica
Identificación de entidades:
DNI
IBAN
importes
fechas
empresas
⚖️ 4. Validación de negocio (CAE)
Consistencia entre documentos
Reglas legales y administrativas
Validación cruzada entre fuentes
🤖 5. Automatización de procesos (Auto-fill)
Relleno automático de formularios
Reducción de carga manual del usuario
📊 6. Auditoría y trazabilidad
Registro completo de eventos
Evidencia legal de cada operación
Trazabilidad end-to-end
🔁 7. Aprendizaje continuo (MLOps)
Correcciones humanas retroalimentan el sistema
Mejora progresiva de modelos de IA
🧩 PARADIGMA ARQUITECTÓNICO

Este sistema no es monolítico, sino una combinación de varios paradigmas:

🟦 1. Arquitectura de microservicios

Cada fase o bloque funcional está desacoplado:

ingestión
procesamiento
IA
validación
auditoría

👉 Cada uno puede escalar y evolucionar de forma independiente.

🔁 2. Event-driven architecture

El sistema funciona por eventos:

“Documento recibido”
“OCR completado”
“Validación fallida”

👉 Todo fluye mediante colas y buses de eventos.

Ejemplo de infraestructura típica:
Azure Service Bus

🧠 3. MLOps (Machine Learning Operations)

El sistema no solo ejecuta IA, sino que aprende:

captura feedback humano
reentrena modelos periódicamente
ajusta precisión del OCR y clasificación

👉 Esto convierte el sistema en “evolutivo”.

⚙️ 4. Procesamiento distribuido

Los documentos se procesan en paralelo:

múltiples workers
fan-out / fan-in
ejecución concurrente por documento

👉 Optimiza tiempo y escalabilidad.

🤖 5. IA documental (Intelligent Document Processing)

Combina:

OCR clásico
visión artificial
LLMs multimodales
clasificación automática
extracción estructurada

Ejemplo de modelo multimodal:
GPT-4o

DINÁMICA OPERATIVA COMPLETA (FASES 1–21)
⚙️ FASE 1 — FRONTEND (Captura del expediente)

El usuario sube un expediente compuesto por múltiples documentos (PDFs, imágenes, escaneos).

🔧 Función técnica:
validación básica de formato (PDF, JPG, PNG)
control de tamaño y número de archivos
experiencia de usuario de carga (UX upload)
empaquetado del expediente
🎯 Problema que resuelve:

Evita que contenido inválido llegue al backend, reduciendo coste computacional y errores posteriores en IA.

⚙️ FASE 2 — API GATEWAY (SEGURIDAD PERIMETRAL)

Punto de entrada controlado del sistema.

🔧 Función técnica:
autenticación (JWT / OAuth2)
control de tasa (rate limiting)
validación inicial de requests
inspección básica de seguridad

Microsoft (Azure API Management)

🎯 Problema que resuelve:

Protege el sistema contra ataques, abuso y saturación de tráfico.

⚙️ FASE 3 — IDEMPOTENCIA + CONTROL DE EXPEDIENTE
🔧 Función técnica:
generación de Expedition_ID
control de duplicidad de requests
asignación de tenant (multi-empresa)
deduplicación lógica de procesos
🎯 Problema:

Evita re-procesamiento por errores del usuario o retries automáticos.

⚙️ FASE 4 — ALMACENAMIENTO BRUTO (RAW DATA LAKE)
🔧 Función técnica:
almacenamiento inmutable del documento original
registro exacto del input recibido
persistencia para auditoría

Azure Data Lake Storage

🎯 Problema:

Garantiza trazabilidad legal completa (RGPD / auditoría).

⚙️ FASE 5 — FINGERPRINTING / DEDUPLICACIÓN
🔧 Función técnica:
generación de hash o embeddings del documento
comparación semántica con históricos
detección de duplicados exactos o similares
🎯 Problema:

Evita reprocesar documentos ya analizados (ahorro de coste IA).

⚙️ FASE 6 — EVENT ROUTER (COLAS DE ENTRADA)
🔧 Función técnica:
enrutado de eventos hacia colas
separación fast path / durable path
desacoplo del sistema

Azure Service Bus

🎯 Problema:

Permite absorber picos de carga sin colapsar el sistema.

⚙️ FASE 7 — ORQUESTADOR (STATE MACHINE)
🔧 Función técnica:
control del estado del expediente
persistencia del progreso
recuperación tras fallos

Azure Durable Functions

🎯 Problema:

Evita pérdida de estado en procesos largos o distribuidos.

⚙️ FASE 8 — FAN-OUT (PARALELIZACIÓN)
🔧 Función técnica:
división del expediente en documentos
ejecución de workers en paralelo
distribución en cloud
🎯 Problema:

Reduce drásticamente tiempos de procesamiento.

⚙️ FASE 9 — PREPROCESADO DE DOCUMENTO
🔧 Función técnica:
mejora de imagen (rotación, contraste, ruido)
detección de tipo de entrada (imagen vs PDF)
limpieza visual previa a IA
🎯 Problema:

Mejora la calidad de entrada para OCR y modelos de visión.

⚙️ FASE 10 — CLASIFICACIÓN DOCUMENTAL
🔧 Función técnica:
identificación del tipo de documento:
factura
contrato
nómina
DNI
🎯 Problema:

Permite enrutar el procesamiento correcto por tipo documental.

⚙️ FASE 11 — OCR (EXTRACCIÓN DE TEXTO)
🔧 Función técnica:
conversión imagen → texto
extracción directa si PDF es digital

Azure AI Document Intelligence

🎯 Problema:

Convierte contenido no estructurado en texto procesable.

⚙️ FASE 12 — IA MULTIMODAL (FALLBACK)
🔧 Función técnica:
análisis de documentos complejos o degradados
reconstrucción semántica del contenido
interpretación visual avanzada

GPT-4o

🎯 Problema:

Resuelve casos donde OCR tradicional falla.

⚙️ FASE 13 — EXTRACCIÓN SEMÁNTICA (NER)
🔧 Función técnica:
extracción de entidades:
DNI
IBAN
importes
fechas
🎯 Problema:

Transforma texto en datos estructurados utilizables.

⚙️ FASE 14 — AGENTES ESPECIALIZADOS
🔧 Función técnica:
agentes por dominio:
fiscal
legal
financiero
🎯 Problema:

Añade análisis experto específico por tipo documental.

⚙️ FASE 15 — NORMALIZACIÓN DE DATOS
🔧 Función técnica:
estandarización de formatos:
fechas
monedas
identificadores
🎯 Problema:

Evita inconsistencias entre documentos y sistemas.

⚙️ FASE 16 — VALIDACIÓN DE ESQUEMA
🔧 Función técnica:
validación JSON Schema
control de estructura de salida
🎯 Problema:

Evita datos corruptos o incompletos en outputs.

⚙️ FASE 17 — MOTOR DE REGLAS DE NEGOCIO (CAE)
🔧 Función técnica:
validación normativa y legal
coherencia documental
reglas CAE
🎯 Problema:

La IA no puede decidir cumplimiento legal por sí sola.

⚙️ FASE 18 — RESOLUCIÓN DE INCONSISTENCIAS
🔧 Función técnica:
detección de conflictos:
fechas incompatibles
datos contradictorios
🎯 Problema:

Garantiza coherencia global del expediente.

⚙️ FASE 19 — SCORING DE RIESGO
🔧 Función técnica:
asignación de nivel:
verde (OK)
amarillo (revisión humana)
rojo (bloqueo)
🎯 Problema:

Automatiza priorización y control de riesgo.

⚙️ FASE 20 — DEAD LETTER QUEUE (DLQ)
🔧 Función técnica:
almacenamiento de errores de procesamiento
reintentos controlados
análisis posterior

Azure Service Bus

🎯 Problema:

Evita pérdida de procesos fallidos o corruptos.

⚙️ FASE 21 — OBSERVABILIDAD Y AUDITORÍA
🔧 Función técnica:
logging completo del sistema
trazas distribuidas
métricas de IA
auditoría RGPD / ISO

Azure Monitor

🎯 Problema:

Garantiza cumplimiento legal, debugging y control total del sistema.

🧠 RESUMEN FINAL (MUY IMPORTANTE)
⚙️ Fases 1–8

👉 Ingesta + seguridad + infraestructura + paralelización

🤖 Fases 9–14

👉 IA documental (OCR + visión + NLP + agentes)

📊 Fases 15–19

👉 negocio, validación, reglas CAE y scoring

🔐 Fases 20–21

👉 resiliencia + auditoría + compliance

FASE 1 — FRONTEND (0–1)
Nodos:
0 Upload Pack (9 Docs)
1 API Gateway trigger
Función:
subida de expediente
validación básica en cliente
⚙️ FASE 2 — EDGE SECURITY (2–5)
Nodos:
2 Auth (JWT + Rate Limit)
3 Valid Request?
4 Reject UX Error
5 Generate Expedition ID
Función:
seguridad perimetral
control de acceso
identificación de expediente
⚙️ FASE 3 — IDEMPOTENCIA (6–9)
Nodos:
6 Idempotency Check
7 Already processed?
8 Return Cached Result
9 Tenant Context
Función:
evitar duplicados
aislamiento multi-tenant
⚙️ FASE 4 — STORAGE RAW (10–14)
Nodos:
10 Blob Storage RAW
11 Fingerprint (Hash/Embeddings)
12 Duplicate?
13 Stop Processing
14 Event Router
Función:
almacenamiento inmutable
deduplicación documental
⚙️ FASE 5 — EVENT BACKBONE (15–19)
Nodos:
15 Redis Queue (Fast Path)
16 Service Bus Path
17 Dead Letter Queue
18 Retry Manager
19 Orchestrator

Azure Service Bus

Función:
sistema de mensajería distribuida
desacoplo total
⚙️ FASE 6 — ORQUESTACIÓN (20–21)
Nodos:
20 State Machine (Redis + FSM)
21 Audit Log / Firehose
Función:
control de estado del expediente
trazabilidad completa
⚙️ FASE 7 — FAN-OUT (22–23)
Nodos:
22 Fan-Out Doc Workers (x9)
23 Sub-Runtime Trigger
Función:
paralelización masiva
⚙️ FASE 8 — PIPELINE DOCUMENTAL (24–43)
Nodos:
24 PDF Parser + Splitter
25 Content Type
26 Text Extraction
27 Image Preprocess
28 Vision Preprocessing
29 OCR Engine
30 Confidence Score
31 Multimodal LLM Fallback
32 Text Fusion
33 Normalization
34 NER Extraction
35 Document Classifier
36 DNI Agent
37 Invoice Agent
38 Contract Agent
39 Insurance Agent
40 Fiscal Agent
41 Legal Agent
42 Generic Agent
43 Extracted JSON

GPT-4o

Función:
OCR + visión + NLP + agentes especializados
⚙️ FASE 9 — AGREGACIÓN (44–45)
Nodos:
44 Async Aggregator
45 Unified Expedition JSON
Función:
consolidación del expediente
⚙️ FASE 10 — VALIDACIÓN CAE (46–54)
Nodos:
46 Global Fingerprint
47 Similarity Check
48 Blocked Duplicate
49 Business Rules Engine
50 Scoring Engine
51 Final Decision
52 Approved
53 Human Review
54 Rejected
Función:
validación legal + negocio + scoring
⚙️ FASE 11 — OUTPUT UX (55)
Nodo:
55 Auto-fill UI / Feedback
Función:
autocompletado del sistema
⚙️ FASE 12 — MLOPS LOOP (56–61)
Nodos:
56 Supervisor UI
57 Labeling
58 Dataset Builder
59 Fine-Tuning Pipeline
60 Model Registry
61 Vector DB Update

Azure Machine Learning

Función:
aprendizaje continuo del sistema
⚙️ FASE 13 — OBSERVABILIDAD (62)
Nodo:
62 Monitoring / Tracing / Logs

Azure Monitor

Función:
auditoría completa + compliance
🧠 RESUMEN ESTRUCTURAL REAL
🔵 CAPA 1 — INGESTA (F1–F4)

Subida + seguridad + deduplicación

🟢 CAPA 2 — CORE INFRA (F5–F7)

colas + orquestación + paralelismo

🟡 CAPA 3 — IA DOCUMENTAL (F8–F9)

OCR + visión + NLP + agentes

🔴 CAPA 4 — NEGOCIO (F10–F11)

CAE + scoring + UX

⚫ CAPA 5 — EVOLUCIÓN (F12–F13)

MLOps + observabilidad
