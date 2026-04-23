Perfecto, aquí ya no sirve “ver diagramas”, sirve **entender el sistema como una máquina completa**. Te lo explico como si fueras a implementarlo en producción de verdad, fase por fase, sin huecos.

---

# 🧠 SISTEMA COMPLETO (EXPLICADO DE VERDAD, DE EXTREMO A EXTREMO)

Esto no es un pipeline lineal. Es:

> 🧩 un sistema distribuido de decisión + IA + estado + aprendizaje continuo

---

# 🟢 FASE 1 — FRONTEND (CAPTURA DEL EXPEDIENTE)

El usuario sube:

- 9 documentos (PDFs o imágenes)
- en un solo “expediente”

📌 Aquí NO hay IA.

Solo:

- UI upload
- validación básica cliente

📌 Problema que resuelve:
evitar carga inválida antes de gastar backend

---

# 🔐 FASE 2 — API GATEWAY (FILTRO DE ENTRADA)

Aquí se decide si el sistema acepta el expediente.

Hace:

- autenticación (JWT)
- rate limit
- antivirus
- validación de formato
- tamaño de archivos

📌 Importante:
si falla aquí → el sistema ni empieza

---

# 🆔 FASE 3 — ID + IDEMPOTENCIA

Se genera:

- ID único del expediente

y se evita esto:

> “el usuario sube el mismo expediente 3 veces por error”

📌 Esto es crítico porque:

- hay retries
- hay redes inestables
- hay usuarios duplicando uploads

---

# 🔐 FASE 4 — CONTEXTO DE SEGURIDAD

Se añade:

- tenant (cliente)
- permisos
- cifrado

📌 Esto asegura:

- separación de empresas
- datos aislados
- seguridad legal (GDPR)

---

# 🧊 FASE 5 — STORAGE RAW (PDF INMUTABLE)

Se guarda el expediente tal cual llega:

- Blob storage
- versionado
- cifrado

📌 Esto es la “fuente de verdad”

Nunca se modifica.

---

# 🧠 FASE 6 — FINGERPRINT (ANTI-DUPLICADO INTELIGENTE)

Aquí empieza lo interesante.

Se genera una “huella del documento”:

No es solo hash.

Es mezcla de:

- hash estructural
- embeddings semánticos
- características visuales

📌 Sirve para:

- detectar duplicados incluso si cambian cosas mínimas

---

# ⚡ FASE 7 — EVENT ROUTER

Decide cómo se procesa:

- Redis Queue → rápido (real-time)
- Service Bus → batch (masivo / diferido)

📌 Esto permite:

- escalar
- priorizar usuarios VIP
- separar carga pesada

---

# 🧠 FASE 8 — ORQUESTADOR (CEREBRO DEL SISTEMA)

Aquí vive la lógica central.

Hace:

- controla flujo del expediente
- decide siguiente paso
- recupera estado desde Redis

📌 Esto es clave:
sin esto, todo sería caótico

---

# 🧾 FASE 9 — STATE MACHINE (REDIS)

Redis guarda TODO:

- estado del expediente
- estado de cada documento
- progreso IA
- errores
- retries

📌 Estados típicos:

```
RECEIVED
PROCESSING
DOCS_DONE
SCORING
COMPLETED
FAILED
```

---

# 📦 FASE 10 — FAN OUT (PARALELIZACIÓN)

El expediente se divide en:

- 9 documentos → 9 workers

📌 Esto evita:

- procesamiento secuencial lento
- UX de “espera eterna”

---

# 📄 FASE 11 — PDF PARSER

Cada documento:

- se abre
- se divide en páginas

📌 Aquí empieza la estructura real del contenido

---

# 🧾 FASE 12 — DETECCIÓN DE CONTENIDO

Por página:

- texto digital
- imagen escaneada
- mixto

📌 Esto define el camino siguiente

---

# 🖼️ FASE 13 — VISION PREPROCESSING

Si es imagen:

- deskew (alinear)
- denoise (ruido)
- mejorar contraste

📌 objetivo:
hacer el OCR más preciso

---

# 👁️ FASE 14 — OCR

Convierte imagen → texto

📌 pero:

- no siempre es fiable
- depende calidad documento

---

# 🤖 FASE 15 — FALLBACK LLM VISION

Si OCR falla:

- modelo multimodal (GPT-4o / Claude)

📌 esto salva casos difíciles:

- fotos malas
- escaneos rotos

---

# 🧹 FASE 16 — NORMALIZACIÓN

El texto bruto se limpia:

- encoding roto
- espacios raros
- errores OCR

📌 salida:
texto estructurado limpio

---

# 🧠 FASE 17 — NER (EXTRACCIÓN SEMÁNTICA)

Extrae:

- nombres
- fechas
- importes
- entidades legales

📌 aquí empieza “entender el documento”

---

# 📑 FASE 18 — CLASIFICADOR DOCUMENTAL

Detecta tipo:

- DNI
- factura
- contrato
- fiscal
- legal

📌 esto decide qué agente usar

---

# 🤖 FASE 19 — AGENTES ESPECIALIZADOS

Cada uno es experto:

- DNI Agent → identidad
- Invoice Agent → facturas
- Contract Agent → contratos
- Legal Agent → cláusulas legales
- Fiscal Agent → impuestos

📌 cada uno convierte texto → JSON estructurado

---

# 🧩 FASE 20 — FAN-IN (RECONSTRUCCIÓN DEL EXPEDIENTE)

Ahora se juntan los 9 documentos:

- coherencia entre ellos
- contradicciones
- duplicidades

📌 resultado:

👉 expediente único estructurado

---

# ⚖️ FASE 21 — DECISIÓN FINAL (CAE + IA)

Aquí se decide:

- aprobar
- revisión humana
- rechazar

Usa:

- reglas fijas (CAE)
- scoring IA
- coherencia global

---

# 🔁 CAPA TRANSVERSAL (IMPORTANTÍSIMA)

## 🧠 Redis updates constantes

Cada fase actualiza estado

## 📊 Observabilidad

- logs
- métricas
- trazas

## 🧠 Learning loop

- humanos corrigen
- IA se reentrena
- modelos evolucionan

---

# 🧠 IDEA CLAVE FINAL

Esto NO es un pipeline.

Es:

> 🧠 un sistema de decisión distribuido sobre documentos con memoria, aprendizaje y control de estado.

---

# 🚀 SI QUIERES EL SIGUIENTE NIVEL

Puedo llevarte esto a nivel aún más real:

- cuánto cuesta cada fase (€ por expediente)
- cuellos de botella reales
- arquitectura Azure/AWS equivalente
- cómo escalar a millones de docs/día
- cómo evitar fallos de IA en producción crítica

Solo dime.

flowchart LR

%% ===================== 1. FRONTEND =====================
subgraph L1["1. FRONTEND"]
A["1.1 Upload Pack (9 Docs)"] --> B["1.2 API Gateway"]
end

%% ===================== 2. API =====================
subgraph L2["2. API GATEWAY"]
B --> B1["2.1 Auth (JWT) + Rate Limit"]
B1 --> B2{"2.2 Valid Request?"}
B2 -- No --> ERR["2.3 Reject + UX Error"]
B2 -- Yes --> ID["2.4 Generate Expedition ID"]
end

%% ===================== 3. IDENTITY =====================
subgraph L3["3. IDENTITY + IDEMPOTENCY"]
ID --> ID2["3.1 Idempotency Check"]
ID2 --> ID3{"3.2 Already processed?"}
ID3 -- Yes --> CACHE["3.3 Return Cached Result"]
ID3 -- No --> SEC["3.4 Security Context (Tenant + Encryption)"]
end

%% ===================== 4. STORAGE =====================
subgraph L4["4. STORAGE"]
SEC --> RAW["4.1 Blob Storage RAW (Immutable PDFs)"]
RAW --> FP0["4.2 Pre-Fingerprint (Hash + Embeddings)"]
FP0 --> FP1{"4.3 Duplicate?"}
FP1 -- Yes --> DUP["4.4 Stop (Duplicate Detected)"]
FP1 -- No --> EVT["4.5 Event Router"]
end

%% ===================== 5. EVENT BACKBONE =====================
subgraph L5["5. EVENT BACKBONE"]
EVT --> RQ["5.1 Redis Queue (Fast Path)"]
EVT --> SB["5.2 Service Bus (Reliable Path)"]

SB --> DLQ["5.3 Dead Letter Queue"]
SB --> RETRY["5.4 Retry Manager"]

RQ --> ORCH["5.5 Orchestrator"]
SB --> ORCH
end

%% ===================== 6. ORCHESTRATION =====================
subgraph L6["6. ORCHESTRATION + STATE"]
ORCH --> STATE[(6.1 Redis Live State)]
ORCH --> CACHE2[(6.2 Read Model Cache)]
ORCH --> AUDIT["6.3 Event Log"]
ORCH --> FSM["6.4 State Machine (RECEIVED → DONE)"]
end

%% ===================== 7. WORKERS =====================
subgraph L7["7. WORKER POOL"]
ORCH --> W1["7.1 Doc Workers (xN)"]
W1 --> PIPE["7.2 Document Pipeline"]
end

%% ===================== 8. DOCUMENT PIPELINE =====================
subgraph L8["8. DOCUMENT PIPELINE"]

PIPE --> SPLIT["8.1 PDF Parser + Splitter"]

SPLIT --> T{"8.2 Content Type"}
T -- Text --> TXT["8.3 Text Extraction"]
T -- Image --> IMG["8.4 Render Page"]

IMG --> PRE["8.5 Vision Preprocessing"]
PRE --> OCR["8.6 OCR Engine"]

OCR --> CONF{"8.7 Confidence Score"}
CONF -- Low --> VLM["8.8 Multimodal LLM Fallback"]
CONF -- High --> TXT2["8.9 Merge Text"]

VLM --> TXT2
TXT --> TXT2

TXT2 --> NORM["8.10 Normalization"]
NORM --> NER["8.11 NER + Entities"]

NER --> CLASS{"8.12 Document Classifier"}

CLASS --> D1["8.13 DNI Agent"]
CLASS --> D2["8.14 Invoice Agent"]
CLASS --> D3["8.15 Contract Agent"]
CLASS --> D4["8.16 Insurance Agent"]
CLASS --> D5["8.17 Fiscal Agent"]
CLASS --> D6["8.18 Legal Agent"]
CLASS --> D7["8.19 Generic Agent"]

D1 --> J1["8.20 JSON Output"]
D2 --> J2["8.20 JSON Output"]
D3 --> J3["8.20 JSON Output"]
D4 --> J4["8.20 JSON Output"]
D5 --> J5["8.20 JSON Output"]
D6 --> J6["8.20 JSON Output"]
D7 --> J7["8.20 JSON Output"]

end

%% ===================== 9. AGGREGATION =====================
subgraph L9["9. FAN-IN AGGREGATION"]
J1 --> AGG["9.1 Aggregator"]
J2 --> AGG
J3 --> AGG
J4 --> AGG
J5 --> AGG
J6 --> AGG
J7 --> AGG

AGG --> UNIFIED["9.2 Unified Expedition JSON"]
end

%% ===================== 10. VALIDATION ENGINE =====================
subgraph L10["10. CAE + SCORING ENGINE"]
UNIFIED --> FP2["10.1 Semantic Fingerprint"]

FP2 --> SIM{"10.2 Similarity Check"}

SIM -- Duplicate --> DUP2["10.3 Blocked Duplicate"]
SIM -- New --> RULES["10.4 Rules Engine (CAE)"]

RULES --> SCORE["10.5 Scoring Engine (Rules + ML)"]
SCORE --> DEC{"10.6 Final Decision"}

DEC -- >0.9 --> OK["10.7 Approved"]
DEC -- 0.7-0.9 --> REV["10.8 Human Review"]
DEC -- <0.7 --> REJ["10.9 Rejected"]
end

%% ===================== 11. OUTPUT =====================
subgraph L11["11. UX OUTPUT"]
OK --> UX["11.1 Auto-fill UI"]
REV --> UX
REJ --> UX
DUP2 --> UX
CACHE --> UX
CACHE2 --> UX
end

%% ===================== 12. HUMAN LOOP =====================
subgraph L12["12. HUMAN LOOP + LEARNING"]
REV --> HUMAN["12.1 Supervisor UI"]
HUMAN --> LABEL["12.2 Corrections"]

LABEL --> DATASET["12.3 Dataset Builder"]
DATASET --> FINE["12.4 Fine-tuning Pipeline"]
FINE --> REG["12.5 Model Registry"]

LABEL --> FPDB["12.6 Fingerprint DB Update"]
end

%% ===================== 13. OBSERVABILITY =====================
subgraph L13["13. OBSERVABILITY"]
AUDIT --> MON["13.1 Monitoring + Metrics + Tracing"]
STATE --> MON
CACHE2 --> MON
DLQ --> MON
end

%% ===================== 14. RETRIES =====================
RETRY --> ORCH
SB --> RETRY
SB --> DLQ
