RQUITECTURA COMPLETA DEL SISTEMA (FASES + NODOS + FLUJO REAL)
⚙️ FASE 1 — FRONTEND (Captura del expediente)
🧩 Nodos: 0 → 1
🔹 Nodos del sistema
0 — Upload Pack (9 Docs)
1 — API Gateway Trigger
🔧 Qué hace esta fase

El usuario carga un expediente completo con múltiples documentos (PDFs o imágenes).
El frontend no procesa lógica compleja: solo prepara y envía el paquete al backend.

🎯 Problema que resuelve
Evita documentos corruptos o incompletos
Reduce carga innecesaria en backend
Mejora UX de subida masiva
⚙️ FASE 2 — EDGE SECURITY (Gateway)
🧩 Nodos: 2 → 5
🔹 Nodos
2 — Auth (JWT + Rate Limit)
3 — Valid Request?
4 — Reject UX Error
5 — Generate Expedition ID
🔧 Qué hace esta fase

Es la barrera de entrada del sistema:

autentica usuario
limita abuso
valida request
genera ID único del expediente
🎯 Problema que resuelve
ataques / bots
saturación del sistema
requests inválidas
trazabilidad inicial
⚙️ FASE 3 — IDEMPOTENCIA + CONTEXTO
🧩 Nodos: 6 → 9
🔹 Nodos
6 — Idempotency Check
7 — Already processed?
8 — Return Cached Result
9 — Tenant Context
🔧 Qué hace esta fase

Evita procesar dos veces el mismo expediente:

detecta duplicados lógicos
recupera resultados previos
asigna multi-tenant
🎯 Problema que resuelve
retries del usuario
duplicación de coste IA
mezcla de empresas
⚙️ FASE 4 — STORAGE RAW (Data Lake)
🧩 Nodos: 10 → 14
🔹 Nodos
10 — Blob Storage RAW
11 — Fingerprint (Hash/Embeddings)
12 — Duplicate?
13 — Stop Processing
14 — Event Router
🔧 Qué hace esta fase

Guarda todo el expediente en bruto e inmutable y detecta duplicados físicos.

🎯 Problema que resuelve
auditoría legal (RGPD)
trazabilidad completa
evitar reprocesamiento
⚙️ FASE 5 — EVENT BACKBONE (Mensajería)
🧩 Nodos: 15 → 19
🔹 Nodos
15 — Redis Queue (Fast Path)
16 — Service Bus Path
17 — Dead Letter Queue
18 — Retry Manager
19 — Orchestrator
🔧 Qué hace esta fase

Sistema de colas que desacopla todo el pipeline.

🎯 Problema que resuelve
picos de tráfico
resiliencia
tolerancia a fallos
⚙️ FASE 6 — ORQUESTACIÓN (State Machine)
🧩 Nodos: 20 → 21
🔹 Nodos
20 — State Machine (Redis + FSM)
21 — Audit Log / Firehose
🔧 Qué hace esta fase

Controla el estado global del expediente.

🎯 Problema que resuelve
recuperación de procesos largos
trazabilidad total del flujo
⚙️ FASE 7 — FAN-OUT (Paralelización)
🧩 Nodos: 22 → 23
🔹 Nodos
22 — Fan-Out Doc Workers (x9)
23 — Sub-Runtime Trigger
🔧 Qué hace esta fase

Divide expediente en documentos y los procesa en paralelo.

🎯 Problema que resuelve
reduce tiempo de procesamiento
escala horizontalmente
⚙️ FASE 8 — PIPELINE DOCUMENTAL (IA CORE)
🧩 Nodos: 24 → 43
🔹 Nodos
24 — PDF Parser + Splitter
25 — Content Type
26 — Text Extraction
27 — Image Preprocess
28 — Vision Preprocessing
29 — OCR Engine
30 — Confidence Score
31 — Multimodal LLM Fallback
32 — Text Fusion
33 — Normalization
34 — NER Extraction
35 — Document Classifier
36 — DNI Agent
37 — Invoice Agent
38 — Contract Agent
39 — Insurance Agent
40 — Fiscal Agent
41 — Legal Agent
42 — Generic Agent
43 — Extracted JSON
🔧 Qué hace esta fase

Es el corazón del sistema:

OCR
visión artificial
LLM multimodal
clasificación documental
extracción estructurada
🎯 Problema que resuelve
documentos no estructurados
imágenes malas
PDFs mixtos
interpretación semántica
⚙️ FASE 9 — AGREGACIÓN (Fan-in)
🧩 Nodos: 44 → 45
🔹 Nodos
44 — Async Aggregator
45 — Unified Expedition JSON
🔧 Qué hace esta fase

Une todos los documentos procesados en una sola estructura.

🎯 Problema que resuelve
fragmentación de datos
coherencia global del expediente
⚙️ FASE 10 — VALIDACIÓN CAE (Negocio + Legal)
🧩 Nodos: 46 → 54
🔹 Nodos
46 — Global Fingerprint
47 — Similarity Check
48 — Blocked Duplicate
49 — Business Rules Engine
50 — Scoring Engine
51 — Final Decision
52 — Approved
53 — Human Review
54 — Rejected
🔧 Qué hace esta fase

Valida el expediente contra reglas legales y de negocio.

🎯 Problema que resuelve
cumplimiento CAE
fraude documental
coherencia normativa
⚙️ FASE 11 — OUTPUT UX
🧩 NODO: 55
🔹 Nodo
55 — Auto-fill UI / Feedback
🔧 Qué hace esta fase

Entrega resultado al usuario:

formularios auto-rellenados
feedback de validación
🎯 Problema que resuelve
elimina trabajo manual
⚙️ FASE 12 — MLOPS LOOP
🧩 Nodos: 56 → 61
🔹 Nodos
56 — Supervisor UI
57 — Labeling
58 — Dataset Builder
59 — Fine-Tuning Pipeline
60 — Model Registry
61 — Vector DB Update
🔧 Qué hace esta fase

Sistema de aprendizaje continuo:

humanos corrigen
datos se etiquetan
modelos se reentrenan
🎯 Problema que resuelve
deriva del modelo
mejora continua del OCR + NER + agentes
⚙️ FASE 13 — OBSERVABILIDAD
🧩 NODO: 62
🔹 Nodo
62 — Monitoring / Tracing / Logs
🔧 Qué hace esta fase

Control total del sistema:

logs distribuidos
métricas IA
auditoría RGPD
🎯 Problema que resuelve
debugging
compliance legal
control operacional
🧠 RESUMEN FINAL (LO IMPORTANTE DE VERDAD)
🔵 CAPA 1 — INGESTA (0–14)

Frontend + seguridad + almacenamiento + colas

🟢 CAPA 2 — CORE (15–23)

mensajería + orquestación + paralelización

🟡 CAPA 3 — IA (24–43)

OCR + visión + LLM + agentes

🔴 CAPA 4 — NEGOCIO (44–55)

agregación + CAE + scoring + UX

⚫ CAPA 5 — EVOLUCIÓN (56–62)

MLOps + observabilidad

🔵 CAPA 1 — INGESTA (0–14)

Frontend + seguridad + almacenamiento + colas

🟢 CAPA 2 — CORE (15–23)

mensajería + orquestación + paralelización

🟡 CAPA 3 — IA (24–43)

OCR + visión + LLM + agentes

🔴 CAPA 4 — NEGOCIO (44–55)

agregación + CAE + scoring + UX

⚫ CAPA 5 — EVOLUCIÓN (56–62)

MLOps + observabilidad
