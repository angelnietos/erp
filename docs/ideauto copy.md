🏗️ Arquitectura de Procesamiento Inteligente de Documentos (IDP)
Especificación Técnica Avanzada (Producción)
🧭 1. VISIÓN GENERAL DEL SISTEMA

El sistema implementado en JOSANZ ERP no es un sistema de OCR tradicional.

Se define como un:

⚖️ Sistema de Compliance Automatizado con IA asistida y control determinista

🎯 Objetivos de negocio
Zero-Error Compliance
Ningún vehículo accede con documentación inválida.
Optimización operativa
Reducción >80% en revisión manual.
Auditoría completa
Trazabilidad total ante inspecciones laborales.
Optimización de costes IA (FinOps)
Uso inteligente de modelos según complejidad.
🧱 2. PRINCIPIO ARQUITECTÓNICO CLAVE

🧠 IA interpreta
⚖️ Código decide
👤 Humano corrige excepciones
🔁 Datos mejoran el sistema

📊 3. DIAGRAMA DE ARQUITECTURA (CORREGIDO Y OPTIMIZADO)
graph TD

A[Usuario / API / ERP] --> B[API Management + Azure AD]
B --> C[FastAPI Gateway]
C --> D{Queue Selector}

D -->|Tiempo real| E[Redis]
D -->|Batch| F[Service Bus]

E --> G[Orchestrator Azure Functions]
F --> G

G --> H[Normalization Layer]

H --> I{Routing Decision}

I -->|PDF con texto| J1[PDF Parser]
I -->|Imagen clara| J2[OCR Document Intelligence]
I -->|Imagen compleja| J3[GPT-4o Vision]

J1 --> K[Raw Text]
J2 --> K
J3 --> K

K --> L[Document Classifier]

L --> M{Tipo Documento}

M --> M1[Extractor ITV]
M --> M2[Extractor Seguro]
M --> M3[Extractor PRL]
M --> M4[Extractor ADR]
M --> M5[Extractor Genérico]

M1 --> N[JSON]
M2 --> N
M3 --> N
M4 --> N
M5 --> N

N --> O[Rules Engine Python]
O --> P[Semantic Validator]
P --> Q[Risk Engine]

Q --> R{Decision}

R -->|GREEN| S[Approved]
R -->|AMBER| T[Human Review]
R -->|RED| U[Blocked]

T --> V[Gold Dataset]

S --> W[Audit Log]
T --> W
U --> W
🛠️ 4. DESGLOSE TÉCNICO POR FASE
🏗️ FASE 1 — INGESTA Y CONTROL
🔐 API Management + Azure AD
Función
autenticación
rate limiting
control de acceso multi-tenant
Valor
evita abusos
controla costes IA
permite facturación por cliente
🚀 FastAPI Gateway
Función
recibe archivo
genera document_id
guarda en Blob Storage
Decisión crítica

👉 no ejecuta IA

⚖️ Selector de colas
Sistema Uso Beneficio
Redis tiempo real baja latencia
Service Bus batch resiliencia
Insight clave

👉 separas:

velocidad (UX)
robustez (backend)
🧠 FASE 2 — INTELIGENCIA Y EXTRACCIÓN
🧹 Normalization Layer
Función
deskew
denoise
conversión HEIC → JPG
DPI fix (300)
Impacto
+15–30% precisión OCR
− uso de GPT Vision
🤖 Routing Decision (IA + heurística)
Función

decidir la ruta más barata posible

Lógica real
if pdf_text_detected → parser
elif imagen_clara → OCR
else → GPT Vision
Impacto económico

👉 reduce coste total 50–80%

📖 Extracción base
Método Coste Uso
PDF Parser ~0 documentos digitales
OCR bajo escaneados
GPT Vision alto casos complejos
Regla clave

👉 Vision nunca es default

🏷️ Clasificador documental
Función

identificar tipo CAE

Riesgo que evita
ITV tratada como seguro
reglas incorrectas
🧩 Extractores especializados
Diseño
1 extractor por tipo documento
prompts cortos
JSON estricto
Ejemplo
{
"plate": "1234ABC",
"expiry_date": "2026-10-10"
}
Ventaja

👉 menos contexto = más precisión
👉 menos tokens = menos coste

⚖️ FASE 3 — COMPLIANCE
⚖️ Rules Engine (Python)
Función

aplicar normativa legal

Ejemplo
if expiry_date < today:
reject()
Regla fundamental

❗ La IA no toma decisiones legales

🧠 Semantic Validator
Función

detectar:

incoherencias
fraude
errores OCR
Ejemplo
fecha válida pero visualmente manipulada
🎯 Risk Engine
Función

unificar decisiones

Output
Score Acción
bajo aprobado
medio revisión
alto bloqueo
👤 FASE 4 — HITL Y MEJORA
🙋 Human-In-The-Loop
Función

resolver incertidumbre

Flujo
ver documento
ver JSON
corregir
Resultado

👉 dataset validado (GOLD)

💎 Gold Dataset
Uso
mejorar prompts
ajustar routing
reducir errores futuros
🗄️ Auditoría (Cosmos DB)
Guarda
documento original
output IA
reglas aplicadas
decisión final
timestamps
Valor legal

👉 cumplimiento inspección laboral
👉 trazabilidad completa

💰 5. OPTIMIZACIÓN DE COSTES (CLAVE)
Distribución real
70–85% → OCR + GPT mini
10–20% → GPT Vision
5–10% → revisión humana
Error típico a evitar

❌ usar GPT para todo
✔ usar IA solo donde aporta valor

🔁 6. FEEDBACK LOOP (VENTAJA COMPETITIVA)
Qué hace

Convierte errores en mejora

Resultado
↓ revisiones manuales mes a mes
↑ precisión
↑ automatización
🚀 7. CONCLUSIÓN

Este sistema no es un pipeline de OCR.

Es un sistema de:

⚖️ Decisión legal automatizada con IA controlada

Ventajas clave
✔ auditable
✔ escalable
✔ optimizado en coste
✔ defendible legalmente
