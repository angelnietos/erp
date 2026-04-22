graph TD

A[Documento CAE] --> B{Gateway validacion}

B -->|Invalid| B1[Rechazo inmediato]
B -->|Valid| C[Upload Blob Storage]

C --> D{Queue selector}
D -->|Fast path| D1[Redis queue]
D -->|Durable path| D2[Service Bus]

D1 --> E[Orchestrator]
D2 --> E

E --> F[Normalization]
F --> G[Image preprocessing]

G --> H{PDF con texto?}

H -->|Si| I1[PDF parser]
H -->|No| I2[OCR Document Intelligence]

I1 --> J[Raw text]
I2 --> J

J --> K{OCR calidad suficiente}

K -->|Alta| L[Texto estructurado]
K -->|Baja| M[GPT-4o Vision fallback]

M --> L

L --> N{Document classifier}

N -->|ITV| O1[Extractor ITV]
N -->|Seguro| O2[Extractor Seguro]
N -->|Permiso circulacion| O3[Extractor Permiso]
N -->|PRL| O4[Extractor PRL]
N -->|Acceso obra| O5[Extractor Acceso]
N -->|Certificado empresa| O6[Extractor Empresa]
N -->|Ficha tecnica| O7[Extractor Tecnica]
N -->|Carnet conductor| O8[Extractor Carnet]
N -->|ADR| O9[Extractor ADR]

O1 --> P
O2 --> P
O3 --> P
O4 --> P
O5 --> P
O6 --> P
O7 --> P
O8 --> P
O9 --> P

P[Structured JSON] --> Q[Rules Engine CAE]

Q --> Q1[Fechas validez]
Q --> Q2[Seguro cobertura]
Q --> Q3[Reglas actividad]
Q --> Q4[Match vehiculo empresa]

Q1 --> R
Q2 --> R
Q3 --> R
Q4 --> R

R --> S[Semantic validator]
S --> T[Risk scoring]

T --> U{Decision}

U -->|Green| V[Aprobado]
U -->|Amber| W[Revision humana]
U -->|Red| X[Rechazado]

W --> Y[Supervisor CAE]
Y --> Z[Gold dataset]

Z --> AA[Mejora extractores]
Z --> AB[Mejora reglas]

V --> AC[Audit log]
W --> AC
X --> AC




🧠 EXPLICACIÓN DETALLADA (LO QUE REALMENTE IMPORTA)

Voy a explicarte cada fase como lo haría un arquitecto senior, sin humo.

🏗️ FASE 1 — INGESTA Y CONTROL
A → B (Gateway)

Aquí decides si el documento vive o muere.

✔ Validas:

MIME type
tamaño
virus / corrupción

👉 Esto evita gastar dinero en IA innecesaria.

C → D (Storage + Colas)

Dos caminos:

Redis (Fast path)
→ usuario esperando respuesta en UI
→ latencia baja

Service Bus (Durable)
→ cargas masivas
→ reintentos garantizados

👉 Esto es clave para escalar sin romper nada.

🧹 FASE 2 — PREPROCESADO (DONDE SE GANA DINERO)
F + G (Normalization + preprocessing)

Aquí haces:

deskew (enderezar)
denoise
contraste
conversión HEIC → PNG
PDF → imágenes

💡 Impacto real:

+20–30% precisión OCR
menos uso de GPT-4o (caro)
🧠 FASE 3 — EXTRACCIÓN INTELIGENTE (CORE)
🔍 Paso crítico: decisión OCR vs parser
H (PDF con texto)

👉 SI:

usas parser (gratis, perfecto)

👉 NO:

OCR (Azure Document Intelligence)
📊 Evaluación de calidad (K)

Aquí decides si confiar o no en el OCR.

Ejemplo real:

confidence < 0.75
texto incoherente
falta matrícula

👉 entonces:

➡ fallback a GPT-4o Vision

🤖 Fallback multimodal (M)

Solo cuando falla OCR.

Esto es CLAVE:

❌ ERROR típico: usar GPT-4o siempre
✅ CORRECTO: usarlo solo como fallback

🧾 FASE 4 — CLASIFICACIÓN Y EXTRACTORES
N (Classifier)

Identifica tipo:

ITV
Seguro
PRL
ADR
etc (9 tipos)
O1–O9 (Extractores especializados)

💡 Esto responde a tu gran duda:

👉 NO es un agente único
👉 SON extractores especializados

Cada uno:

prompt pequeño
contexto mínimo
salida JSON fija

Ejemplo ITV:

{
  "matricula": "",
  "fecha_itv": "",
  "resultado": ""
}

✔ Más precisión
✔ Menos coste
✔ Menos alucinaciones

⚖️ FASE 5 — RULES ENGINE (LO MÁS IMPORTANTE)

Aquí la IA deja de mandar.

Q (motor de reglas)

Código puro:

fechas
coberturas
permisos
relaciones empresa-vehículo

👉 Esto es lo que te salva legalmente.

🛡️ FASE 6 — VALIDACIÓN SEMÁNTICA
S (LLM ligero)

Detecta cosas como:

documento manipulado
incoherencias visuales
datos raros

👉 No decide, solo añade señales.

🎯 FASE 7 — SCORING Y DECISIÓN
T (risk scoring)

Combinas:

reglas (peso alto)
IA (peso medio)
OCR (peso base)
U (decisión final)
🟢 GREEN → automático
🟡 AMBER → humano
🔴 RED → bloqueado
👤 FASE 8 — HUMAN IN THE LOOP
W → Y → Z

El humano:

corrige
valida
confirma

👉 esto genera el activo más importante:

dataset validado por negocio

🔁 FASE 9 — FEEDBACK LOOP
Z → AA / AB

Mejoras:

prompts
extractores
reglas

👉 aquí es donde el sistema se vuelve “inteligente de verdad”

📑 FASE 10 — AUDITORÍA
AC (audit log)

Guardas TODO:

input original
OCR
JSON
reglas ejecutadas
decisión final

👉 esto es lo que te pide una inspección laboral

🧠 RESPUESTA CLAVE A TU DUDA FINAL
❓ ¿Qué son los agentes realmente?

En TU arquitectura:

👉 NO son “copilots independientes gigantes”

👉 SON piezas concretas:

Routing (ligero)
Clasificador
Extractores (x9)
Validador semántico
❗ Lo importante

👉 El flujo lo controla código
👉 La IA SOLO interpreta


💰 1. COSTE REAL POR DOCUMENTO (AFINADO)

Voy a darte un modelo realista basado en uso típico en CAE (no teórico).

🔢 Suposiciones razonables
1 documento = 1–3 páginas
80% pasan por OCR normal
15% usan parser PDF
5% necesitan fallback multimodal
prompts optimizados (cortos)
💸 Coste por componente
🟢 OCR — Azure AI Document Intelligence
~0.01 – 0.03 € por página
👉 promedio documento: 0.02 €
🟢 LLM ligero — GPT-4o mini

Usos:

routing
clasificación
extracción
validación semántica
~0.0005 – 0.002 € por llamada
👉 ~3–5 llamadas por doc

👉 total: 0.003 – 0.01 €

🔴 Multimodal fallback — GPT-4o
solo ~5% docs
~0.02 – 0.06 € por uso

👉 coste medio ponderado: ~0.002 – 0.004 €

☁️ Infraestructura Azure

Incluye:

Microsoft Azure Container Apps
Functions
Storage
colas

👉 coste estimado por doc:
0.003 – 0.01 €

🧮 COSTE TOTAL REALISTA
Escenario	Coste por documento
Optimizado	0.02 – 0.04 €
Normal	0.04 – 0.07 €
Peor caso (mucho Vision)	0.08 – 0.12 €
📊 Coste mensual
Volumen	Coste
10k docs	400 – 700 €
100k docs	4k – 7k €
1M docs	40k – 70k €

👉 Esto es realista en producción.

🧠 2. PROMPTS REALES (LO QUE MARCA LA DIFERENCIA)
🔑 Reglas clave (importantísimo)
JSON estricto
sin texto libre
sin inferencias
campos obligatorios o null
🛠️ Ejemplo — Extractor ITV
SYSTEM:

Eres un sistema experto en documentos de ITV en España.

TAREA:
Extraer datos estructurados de un documento ITV.

REGLAS:
- No inventes datos
- Si no ves un campo → null
- Devuelve SOLO JSON válido
- Fechas en formato YYYY-MM-DD
- Matrícula en mayúsculas sin espacios

SCHEMA:

{
  "tipo": "ITV",
  "matricula": "",
  "fecha_inspeccion": "",
  "fecha_caducidad": "",
  "resultado": "",
  "estacion_itv": ""
}
🛡️ Extractor Seguro
Extrae:

{
  "tipo": "SEGURO",
  "compania": "",
  "numero_poliza": "",
  "fecha_inicio": "",
  "fecha_fin": "",
  "cobertura": "",
  "matricula": ""
}
🚚 Extractor ADR
{
  "tipo": "ADR",
  "numero_certificado": "",
  "fecha_validez": "",
  "clase_material": "",
  "restricciones": ""
}
🧠 Validador semántico
Analiza este JSON y detecta incoherencias.

Responde:

{
  "is_consistent": true/false,
  "issues": []
}
🧱 3. ESTRUCTURA FASTAPI (PRODUCCIÓN REAL)

Esto es lo que separa una demo de un sistema serio.

📁 Estructura
app/
├── main.py
├── api/
│   └── upload.py
├── services/
│   ├── orchestrator.py
│   ├── routing.py
│   ├── ocr_service.py
│   ├── llm_service.py
│   └── extractors/
│       ├── itv.py
│       ├── insurance.py
│       └── adr.py
├── core/
│   ├── config.py
│   └── logging.py
├── workers/
│   └── processor.py
🚀 main.py
from fastapi import FastAPI
from api.upload import router

app = FastAPI()
app.include_router(router)
📥 upload endpoint
from fastapi import APIRouter, UploadFile
from services.orchestrator import process_document

router = APIRouter()

@router.post("/upload")
async def upload(file: UploadFile):
    result = await process_document(file)
    return result
🧠 orchestrator (core del sistema)
async def process_document(file):

    # 1. normalización
    doc = normalize(file)

    # 2. routing
    route = decide_route(doc)

    # 3. extracción base
    if route == "pdf":
        text = extract_pdf(doc)
    elif route == "ocr":
        text = ocr(doc)
    else:
        text = vision(doc)

    # 4. clasificación
    doc_type = classify(text)

    # 5. extracción especializada
    data = extract_by_type(doc_type, text)

    # 6. validación
    validated = validate_rules(data)

    # 7. scoring
    score = score_result(validated)

    return {
        "data": data,
        "score": score
    }
⚙️ routing inteligente
def decide_route(doc):

    if is_pdf_with_text(doc):
        return "pdf"

    if is_clean_image(doc):
        return "ocr"

    return "vision"

👉 Esto evita gastar dinero innecesario.

🧠 4. CLAVES QUE MARCAN LA DIFERENCIA (EXPERIENCIA REAL)
❌ Lo que rompe sistemas
usar GPT-4o para todo
no validar con código
prompts gigantes
no tener fallback
✅ Lo que funciona
OCR primero
IA solo donde aporta valor
reglas deterministas
HITL activo
dataset de mejora
🎯 RESUMEN FINAL

Tu sistema ya está en nivel:

👉 enterprise-grade AI system

Porque:

separa control vs IA
optimiza coste automáticamente
es auditable legalmente

