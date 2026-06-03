# Plataforma CAE v2.0 – Automatización Inteligente de Expedientes (IA)
## Documento Técnico Definitivo
**Ideauto** | Definición Funcional y Arquitectónica | 1 Junio 2026 | Versión 2.0

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)  
2. [Alcance del Proyecto](#2-alcance-del-proyecto)  
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)  
4. [Pipeline de IA – Desglose Técnico](#4-pipeline-de-ia--desglose-técnico)  
5. [Sistema de Confidence (CORE TÉCNICO)](#5-sistema-de-confidence-core-técnico)  
6. [Flujos de Negocio](#6-flujos-de-negocio)  
7. [Seguridad del Sistema](#7-seguridad-del-sistema)  
8. [Monitorización y Logging](#8-monitorización-y-logging)  
9. [Escalabilidad y Resiliencia](#9-escalabilidad-y-resiliencia)  
10. [Coste Estimado](#10-coste-estimado)  
11. [Roadmap de Implementación](#11-roadmap-de-implementación)

---

## 1. Resumen Ejecutivo

La Plataforma CAE v2.0 automatiza la gestión documental mediante un pipeline de IA híbrido (OCR + Document Intelligence + Rules Engine) con sistema evolutivo de confidence scoring, integrado en una arquitectura Azure segura y escalable.

**KPIs MVP:**
- Precisión ≥ 90% | Recall ≥ 85% | F1 ≥ 87%
- Tiempo procesamiento < 15s
- Reducción intervención manual 70%
- Optimización coste 40% (routing inteligente)

---

## 2. Alcance del Proyecto

### 2.1 Incluye
- ✔ Módulo de Expedientes (único afectado)
- ✔ Procesamiento documental automático
- ✔ Extracción estructurada de datos (OCR + DI)
- ✔ Motor de reglas de negocio
- ✔ Sistema de confidence y scoring
- ✔ Revisión humana controlada (cliente/Ideauto)
- ✔ Trazabilidad completa y feedback loop

### 2.2 Excluye
- ✖ Gestión de usuarios
- ✖ Módulos administrativos generales
- ✖ Entrenamiento de modelos en producción
- ✖ Gestión de lotes y permisos

---

## 3. Arquitectura del Sistema

### 3.1 Pipeline de IA (arquitectura real)

```
Cliente Upload
    ↓
API Gateway → Blob Storage → Service Bus Queue
    ↓
Azure Function Orchestrator → Quality Gate (DQS) → Classification
    ↓
Routing Engine
┌─────────────┬─────────────┬──────────────┐
│   OCR       │  Document   │  Multimodal  │
│  (DNI)      │ Intelligenc │  (Contratos) │
│             │ (Facturas)  │              │
└─────────────┴─────────────┴──────────────┘
    ↓
Normalization → Rules Engine → Confidence Engine
    ↓
Decision Engine (Auto-fill / Review / Block)
    ↓
SQL Database ← Event Logging ← App Insights
```

### 3.2 Stack Tecnológico

| Capa | Servicio | Función |
|------|----------|---------|
| **API** | Azure API Management | Gateway, rate limiting, auth |
| **Storage** | Azure Blob Storage | Almacenamiento documentos |
| **Messaging** | Azure Service Bus | Cola procesamiento async |
| **Compute** | Azure Functions | Orquestación sin servidor |
| **AI/ML** | Azure Document Intelligence | OCR + extracción estructurada |
| **Database** | Azure SQL Database | Persistencia expedientes |
| **Monitoring** | Application Insights | Logs, métricas, trazas |
| **Security** | Azure Key Vault | Gestión credenciales |
| **Fallback** | Azure OpenAI (opcional) | IA semántica compleja |

---

## 4. Pipeline de IA – Desglose Técnico

### 4.1 Upload del documento y asignación a expediente

El cliente sube documento vía API:
- Validación JWT en API Gateway
- Almacenamiento en Blob Storage con DocumentId único
- Evento enviado a Service Bus queue

### 4.2 Quality Gate – Validación previa del documento

Antes de IA, se aplica filtro de calidad:

**Validaciones:**
- Formato: PDF/JPG/PNG válido
- Tamaño: >100KB, <15MB
- Resolución mínima: >150 DPI
- Texto detectable (pre-OCR check)
- Ruido <30% zona imagen
- Contenido no vacío

**Document Quality Score (DQS):**
```
DQS = 25% legibilidad + 20% resolución + 20% densidad texto 
      + 15% ausencia ruido + 20% estructura detectada
```

**Umbrales:**
- 85-100: Óptimo → procesar
- 70-84: Aceptable → procesar con warning
- 50-69: Dudoso → review inmediato
- <50: Rechazado → devolver

### 4.3 Classification y Routing inteligente

**Clasificación automática:**
- Document Intelligence prebuilt models
- Fallback regex/keywords para nuevos tipos

**Routing por coste optimizado:**

| Tipo documento | Tecnología | Coste relativo |
|----------------|------------|----------------|
| DNI, matrícula | OCR básico | 1x |
| Factura | Document Intelligence prebuilt | 3x |
| Contrato complejo | Multimodal/OpenAI | 10x |

Ahorro estimado: -35% coste DI

### 4.4 Procesamiento con Document Intelligence

**Modelos utilizados:**
- Prebuilt: prebuilt-idDocument, prebuilt-invoice, prebuilt-receipt
- General document model (fallback)

**Output estructurado:**
```json
{
  "text": "texto plano del documento",
  "fields": {
    "dni": { "value": "12345678Z", "confidence": 0.95 },
    "name": { "value": "APELLIDO NOMBRE", "confidence": 0.92 }
  }
}
```

### 4.5 Normalización de datos

Transformación a modelo interno homogéneo:
- Trim de espacios
- Normalización fechas (ISO 8601)
- Conversión formatos
- Mapeo campos genéricos → campos sistema

### 4.6 Motor de reglas (validación estructural)

**Reglas implementadas:**
- DNI: regex `[0-9]{8}[A-Z]` + checksum letra
- VIN: 17 caracteres, excluir I/O/Q
- Matrícula: formato europeo/Spain
- Fechas: válidas y coherencia temporal
- Campos obligatorios no nulos

**Validación cruzada:**
- Consistencia entre documentos
- Detección duplicados

### 4.7 Cálculo de confidence por campo

Se calcula probabilidad de corrección:

```
Confidence = w₁ × DI_conf + w₂ × OCR + w₃ × Rules + w₄ × Coherence + w₅ × Quality
```

### 4.8 Decisión automática

| Confidence | Acción | UI |
|------------|--------|-----|
| ≥ 0.90 | Auto-fill | ✅ Campo precargado |
| 0.70 - 0.89 | Review | ⚠️ "Sugerido por IA" |
| < 0.70 | Blocked | ❌ Requiere corrección |

### 4.9 Persistencia en expediente

Se guarda:
- Valores finales por campo
- Confidence por campo
- Estado del documento
- Versión del modelo usado
- Timestamp procesamiento
- Correlation ID trazabilidad

### 4.10 Registro de trazabilidad

Eventos registrados:
- upload_event
- processing_start/end
- di_output
- rules_applied
- confidence_calculated
- decision_taken
- human_corrections

---

## 5. Sistema de Confidence (CORE TÉCNICO)

### 5.1 Fórmula Híbrida (Fase 1)

```
Confidence = w₁ × DI_conf + w₂ × OCR + w₃ × Rules + w₄ × Quality
```

### 5.2 Pesos por Tipo Documental

Pesos configurables en JSON (no hardcodeados):

```json
{
  "DNI": {
    "ocr": 0.50,
    "rules": 0.30,
    "model": 0.20
  },
  "FACTURA": {
    "model": 0.60,
    "ocr": 0.10,
    "rules": 0.10,
    "coherence": 0.20
  },
  "CONTRATO": {
    "multimodal": 0.70,
    "ocr": 0.10,
    "rules": 0.10,
    "coherence": 0.10
  },
  "PERMISO": {
    "ocr": 0.40,
    "rules": 0.40,
    "model": 0.20
  }
}
```

### 5.3 Ajuste dinámico por histórico

El sistema ajusta pesos según rendimiento real:

```
weight_nuevo = weight_base × factor_rendimiento
```

**Ejemplo:**
- OCR en DNI: 98% precisión → peso incrementa
- OCR en facturas: 72% precisión → peso decrementa

### 5.4 Evolución futura

#### Fase 2 – Meta-modelo ML (Stacking)
El cálculo desaparece y se sustituye por modelo ML:

**Features de entrada:**
- confidence_ocr
- confidence_di
- rule_score
- coherence_score
- document_quality
- document_type
- historical_corrections
- error_patterns

**Output:** P(campo_correcto) ∈ [0, 1]

Modelos candidatos: Logistic Regression, XGBoost, LightGBM

#### Fase 3 – Learning from corrections
Cada corrección alimenta dataset:

```json
{
  "document_type": "DNI",
  "field": "dni_number",
  "prediction": "12345678Z",
  "correct": "12345678A",
  "error_type": "OCR_misread",
  "context": "scan_mobile"
}
```

---

## 6. Flujos de Negocio

### 6.1 Flujo Cliente

```
1. Crear expediente
2. Subir documentos
3. IA procesa → precarga formulario
4. Revisar/corregir campos
5. Enviar a revisión
6. Expediente bloqueado (estado ENVIADO)
```

**Regla:** No se puede enviar sin documentación obligatoria

### 6.2 Flujo Ideauto

| Acción | Cuándo aplicar | Datos registrados | Efecto |
|--------|----------------|-----------------|--------|
| **Aprobado** | Todo correcto | usuario + timestamp | Cierre y envío |
| **Corregido** | Campos subsanables | valores corregidos/campo | Cierre + feedback |
| **Devuelto** | Falta documentación | motivo devolución | Vuelve cliente |

### 6.3 Flujo detallado – "Revisado corregido"

1. Sistema resalta campos con confidence baja o modificados
2. Ideauto edita valores incorrectos
3. Se registra trazabilidad completa:
   - Valor IA original
   - Valor cliente
   - Valor corregido Ideauto
   - Usuario y timestamp
4. Expediente envía a estado APROBADO

---

## 7. Seguridad del Sistema

### 7.1 Autenticación y Autorización

- **SSO/OIDC:** Azure AD B2C o integración con IdP cliente
- **Tokens JWT:** Emisión y validación en API Gateway
- **RBAC:** Roles cliente/Ideauto/admin con permisos granulares
- **mTLS:** Comunicación interna Functions → Services

### 7.2 Seguridad de Datos

- **TLS 1.3:** Todas comunicaciones
- **Cifrado reposo:** TDE SQL, SSE Blob
- **Key Vault:** Rotación credenciales automática
- **Anonimización:** Campos sensibles tokenizados
- **Auditoría:** Logs acceso datos sensibles

### 7.3 Seguridad de Infraestructura

- **VNet aislado:** Subredes con NSGs restringidas
- **WAF:** Protección OWASP Top 10 en API Management
- **Private Endpoints:** Sin exposición pública de servicios
- **MFA:** Acceso administrativo obligatorio
- **Hardening:** Imágenes Docker escaneadas, parches automáticos

---

## 8. Monitorización y Logging

### 8.1 Métricas Clave

| Tipo | Herramienta | Métricas |
|------|-------------|----------|
| **Infraestructura** | App Insights | CPU, memory, queue_time, function_duration |
| **Aplicación** | App Insights | Latencia endpoint, errores (5xx/4xx), throughput |
| **IA** | Custom metrics | Precision, recall, F1, confidence_avg |
| **Negocio** | Logs | Documentos procesados, errores, tiempos, estados |

### 8.2 Logging y Trazabilidad

**Structured logging:** JSON con correlation ID en todo el pipeline

**Ejemplo evento:**
```json
{
  "correlationId": "uuid-123",
  "documentId": "uuid-456",
  "eventType": "confidence_calculated",
  "field": "dni_number",
  "confidence": 0.85,
  "decision": "REVIEW",
  "timestamp": "2026-06-03T14:00:00Z"
}
```

**Retención:** Logs 2 años (requisitos legales)

**Alertas configuradas:**
- Errores >1%
- Latencia >30s
- Cola pendiente >1000 items

---

## 9. Escalabilidad y Resiliencia

### 9.1 Escalabilidad Horizontal

- **Azure Functions:** Scale-out automático por queue depth
- **Service Bus:** Auto-scaling partitions
- **SQL Database:** Read replicas para consultas analíticas
- **Redis Cache (opcional):** Metadata expedientes frecuente

### 9.2 Alta Disponibilidad

- **Multi-AZ:** Blob + SQL con replicación geográfica
- **Retry policies:** Exponential backoff con jitter
- **Circuit breaker:** Patrón en llamadas externas
- **Graceful degradation:** Fallback OCR si DI falla

### 9.3 Backup y Recuperación

- **SQL Database:** PITR 35 días + snapshots semanales
- **Blob Storage:** Versionado + Soft Delete 90 días
- **Disaster Recovery:** Geo-restore en región secundaria

---

## 10. Coste Estimado (MVP)

| Volumen/mes | Coste estimado |
|-------------|----------------|
| 10K documentos | ~250€ |
| 50K documentos | ~950€ |
| 100K documentos | ~1,800€ |

**Optimización:** Routing inteligente (-35% coste DI), Quality Gate (-15% rechazos)

---

## 11. Roadmap de Implementación

| Fase | Duración | Feature principal |
|------|----------|-------------------|
| **1 - MVP** | 4 semanas | DNI + facturas, confidence básico, review |
| **2 - Expansión** | 3 semanas | Nuevos tipos, reglas avanzadas |
| **3 - Optimización** | 4 semanas | ML confidence, reducción review |
| **4 - Escalabilidad** | 5 semanas | Batch processing, coste optimizado |

---

## Conclusiones

La arquitectura propuesta define una plataforma de automatización documental basada en:

- **Extracción estructurada** (Document Intelligence)
- **Validación determinista** (rules engine)
- **Scoring probabilístico** (confidence engine evolutivo)
- **Revisión humana controlada**
- **Trazabilidad completa**
- **Seguridad en capas**
- **Escalabilidad horizontal automática**

**Archivo creado:** `docs/funcional-documento-ia-v2.0-definitive.md`