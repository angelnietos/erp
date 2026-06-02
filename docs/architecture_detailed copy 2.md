🏗️ 🧩 PIPELINE COMPLETA CAE (PRODUCCIÓN REAL + OPTIMIZACIÓN IMÁGENES)
🧭 DIAGRAMA MERMAID FINAL (CORREGIDO + COMPLETO)
graph TD

A[Documento CAE entrada] --> B{Gateway validacion}

B -->|Invalid| B1[Rechazo inmediato]
B -->|Valid| C[Guardar RAW en Blob Storage]

C --> D{Seleccion cola}
D -->|Tiempo real| D1[Redis]
D -->|Batch| D2[Service Bus]

D1 --> E[Orquestador]
D2 --> E

E --> F[Normalizacion formato]

F --> G{Tipo archivo}

G -->|HEIC/JPG| H1[Convertir a PNG]
G -->|PDF| H2[PDF a imagen PNG]
G -->|PDF texto| H3[Detectar texto embebido]

H1 --> I[Preprocesado imagen]
H2 --> I
H3 --> J{Tiene texto suficiente}

J -->|Si| K1[PDF Parser]
J -->|No| I

I --> K2[OCR Document Intelligence]

K1 --> L[Texto bruto]
K2 --> L

L --> M{Calidad OCR}

M -->|Alta| N[Texto fiable]
M -->|Baja| O[Fallback GPT-4o Vision]

O --> N

N --> P{Clasificador documento}

P -->|ITV| Q1[Extractor ITV]
P -->|Seguro| Q2[Extractor Seguro]
P -->|Permiso| Q3[Extractor Permiso]
P -->|PRL| Q4[Extractor PRL]
P -->|Acceso| Q5[Extractor Acceso]
P -->|Empresa| Q6[Extractor Empresa]
P -->|Ficha tecnica| Q7[Extractor Tecnica]
P -->|Carnet| Q8[Extractor Carnet]
P -->|ADR| Q9[Extractor ADR]

Q1 --> R
Q2 --> R
Q3 --> R
Q4 --> R
Q5 --> R
Q6 --> R
Q7 --> R
Q8 --> R
Q9 --> R

R[JSON estructurado] --> S[Motor reglas CAE]

S --> S1[Validar fechas]
S --> S2[Validar seguros]
S --> S3[Validar actividad]
S --> S4[Match vehiculo empresa]

S1 --> T
S2 --> T
S3 --> T
S4 --> T

T --> U[Validador semantico]
U --> V[Scoring riesgo]

V --> W{Decision}

W -->|Aprobado| X[Acceso permitido]
W -->|Revision| Y[Cola revision humana]
W -->|Rechazado| Z[Acceso bloqueado]

Y --> AA[Supervisor CAE]
AA --> AB[Dataset validado]

AB --> AC[Mejora extractores]
AB --> AD[Mejora reglas]

X --> AE[Audit log]
Y --> AE
Z --> AE

%% OPTIMIZACION IMAGENES
AE --> AF[Guardar PNG procesado]
AE --> AG[Convertir a AVIF/WebP]
AG --> AH[Storage optimizado]
AH --> AI[Frontend / thumbnails]
🧠 EXPLICACIÓN COMPLETA (INTEGRANDO WEBP / AVIF)
🏗️ FASE 1 — INGESTA Y CONTROL
Entrada
PDF, JPG, PNG, HEIC
Qué pasa aquí:
validación MIME
tamaño
seguridad
Clave:

👉 aquí todavía NO hay IA

📦 FASE 2 — STORAGE Y COLAS
Guardas 3 cosas desde el inicio:

1. RAW (intocable)
   auditoría legal
2. Cola inteligente
   Redis → tiempo real
   Service Bus → batch
   🧹 FASE 3 — NORMALIZACIÓN
   Objetivo:

hacer todos los documentos iguales

Conversión:
Entrada Salida
HEIC PNG
JPG PNG
PDF PNG (si no tiene texto)
⚠️ IMPORTANTE

👉 Aquí NO usas WebP ni AVIF
👉 Siempre PNG

🧠 FASE 4 — DECISIÓN INTELIGENTE (SIN IA pesada)
PDF con texto:

✔ parser → GRATIS
✔ precisión 100%

Imagen o escaneo:

✔ OCR con Azure AI Document Intelligence

📊 FASE 5 — CONTROL DE CALIDAD

Si OCR falla:

👉 fallback a GPT-4o

💡 esto es lo que optimiza coste brutalmente

🧾 FASE 6 — CLASIFICACIÓN + EXTRACTORES
Clasificador:
ITV
Seguro
ADR
etc
Extractores especializados:

👉 aquí están los “agentes reales”

✔ prompts pequeños
✔ JSON estricto
✔ menos errores

⚖️ FASE 7 — RULES ENGINE (LEGAL)

Código puro:

fechas
coberturas
permisos
coherencia

👉 esto decide TODO

🧠 FASE 8 — VALIDACIÓN SEMÁNTICA

IA ligera:

incoherencias
fraude visual
errores OCR
🎯 FASE 9 — DECISIÓN
Estado Acción
Verde automático
Ámbar humano
Rojo bloqueo
👤 FASE 10 — HUMAN IN THE LOOP

Aquí pasa lo importante:

👉 dataset real validado por negocio

🔁 FASE 11 — MEJORA CONTINUA

Se mejora:

prompts
extractores
reglas
📑 FASE 12 — AUDITORÍA

Todo queda registrado:

entrada
OCR
IA
reglas
decisión
📸 FASE 13 — OPTIMIZACIÓN CON WEBP / AVIF

Aquí es donde entran de verdad:

🔵 3 versiones del documento

1. RAW
   original
   legal
2. WORKING (PNG)
   para IA
   máxima calidad
3. OPTIMIZED (AVIF / WebP)

👉 aquí conviertes

¿Para qué?
✔ almacenamiento barato
✔ frontend rápido
✔ thumbnails
💡 Flujo correcto

👉 OCR → IA → DECISIÓN → COMPRESIÓN

❌ Nunca

👉 AVIF antes de OCR
👉 WebP antes de extracción

💰 IMPACTO REAL

Con AVIF/WebP:

-50% a -70% almacenamiento
mejor rendimiento UI
menor coste en Microsoft Azure
🧠 RESUMEN FINAL (LO IMPORTANTE)

👉 OCR es la base
👉 IA es capa de inteligencia
👉 reglas toman decisiones
👉 humano entrena el sistema
👉 AVIF/WebP optimiza costes (al final)
