# Plataforma CAE v2.0 – Automatización Inteligente de Expedientes (IA)
**Definición Funcional Final – Ideauto**  
Fecha: 1 Junio 2026

---

## 1. Objetivo del sistema

El objetivo de la Plataforma CAE v2.0 es automatizar la gestión documental de expedientes mediante Inteligencia Artificial, reduciendo la carga manual, mejorando la calidad de los datos y garantizando trazabilidad completa.

 El sistema permite:

- Procesar documentos subidos por clientes
- Validar la calidad del documento antes de su análisis
- Extraer información estructurada automáticamente
- Rellenar formularios del expediente
- Permitir revisión humana controlada
- Registrar todas las interacciones para mejora continua

## 2. Alcance funcional

**Incluye:**
- ✔ Módulo de Expedientes (único afectado)
- ✔ Procesamiento de documentos asociados
- ✔ Extracción y validación de datos
- ✔ Sistema de revisión cliente e Ideauto
- ✔ Motor de confianza y scoring
- ✔ Sistema de feedback analítico

**Excluye:**
- ✖ Gestión de usuarios
- ✖ Gestión de clientes
- ✖ Módulos administrativos generales
- ✖ Lotes y permisos

## 3. Arquitectura funcional de IA

El sistema se basa en un pipeline inteligente dividido en capas:

```
Frontend
    ↓
API Gateway → Blob Storage → Service Bus → Azure Functions
                                          ↓
                        Document Intelligence → Rules Engine → Confidence Engine
                                          ↓
                              SQL Database ← App Insights
```

### 3.1 Capas del pipeline

| Capa | Responsabilidad | Tecnología |
|------|-----------------|------------|
| **Validación de entrada** | Quality Gate - filtros de calidad | Functions + lógica propia |
| **Routing IA** | Selección de tecnología óptima | Prebuilt models DI |
| **Extracción y validación** | OCR + estructura + reglas | Document Intelligence |
| **Feedback y mejora** | Trazabilidad sin retrain real | Analytics + configuración |

## 4. Pipeline de IA (versión técnica)

```
Upload → Quality Gate → Classification → Routing → Extraction → Normalization 
     → Rules Engine → Confidence Scoring → Auto-fill/review → Persist → Feedback Log
```

| Paso | Acción | Detalle técnico |
|------|--------|-----------------|
| 1 | Upload documento | Cliente sube PDF/imagen vía API |
| 2 | Quality Gate | Validación DQS (resol, formato, calidad) |
| 3 | Classification | Identificación tipo (DNI, factura, permiso) |
| 4 | Routing | OCR/DI/Multimodal según documento |
| 5 | Extraction | OCR + key-value extraction |
| 6 | Normalization | Mapeo a modelo interno |
| 7 | Rules Engine | Regex, VIN, fechas, coherencia |
| 8 | Confidence | Cálculo híbrido configurado |
| 9 | Auto-fill | >90% confidence → auto, 70-90% → review |
| 10 | Persist | SQL con valores, confidence, trazabilidad |
| 11 | Feedback Log | Evento completo para análisis |

## 5. Fase 1 – Validación previa del documento (Quality Gate)

Antes de aplicar IA, el sistema evalúa si el documento es procesable.

### Reglas de filtrado

| Validación | Criterio |
|------------|----------|
| Formato | PDF, JPG, PNG válidos |
| Tamaño | >100KB, <15MB |
| Resolución | >150 DPI para texto |
| Legibilidad | Texto detectable (OCR pre-scan) |
| Ruido | <30% zona imagen |
| Contenido | No vacío |

### Document Quality Score (DQS)

```
DQS = 25% legibilidad + 20% resolución + 20% densidad texto 
      + 15% ausencia ruido + 20% estructura detectada
```

**Umbrales:**
- 85-100: Óptimo → procesar
- 70-84: Aceptable → procesar con warning
- 50-69: Dudoso → requerir review inmediato
- <50: Rechazado → devolver sin procesar

## 6. Fase 2 – Clasificación documental

### Tipos soportados (MVP)

- DNI / NIE
- Permiso de circulación
- Ficha técnica
- Factura
- Contrato

La clasificación usa modelos Prebuilt de Document Intelligence o clasificador simple por keywords.

## 7. Fase 3 – Routing inteligente (optimización de costes)

| Tipo documento | Tecnología | Coste relativo |
|----------------|------------|----------------|
| DNI, matrícula | OCR básico | 1x |
| Factura, formulario | Document Intelligence prebuilt | 3x |
| Contrato complejo | Multimodal/OpenAI | 10x |

El routing reduce costes en un 40% evitando procesamiento multimodal innecesario.

## 8. Fase 4 – Extracción de datos

El sistema extrae información y la normaliza al modelo interno.

### Mapeo ejemplo

| Documento origen | Campo origen | Campo sistema |
|------------------|--------------|---------------|
| "Número de bastidor" | VIN | vehicle_vin |
| "Documento identidad" | DNI | customer_dni |
| "Matrícula" | matrícula | vehicle_plate |

## 9. Fase 5 – Validación de datos

### Reglas automáticas

- DNI: regex `[0-9]{8}[A-Z]` + checksum
- VIN: 17 caracteres, sin I/O/Q
- Matrícula: formato europeo/Spain
- Fechas: válidas y coherencia temporal
- Campos obligatorios: no nulos/vacíos

### Validación cruzada

- DNI vs titular del permiso
- Coherencia entre campos
- Detección de duplicados

## 10. Sistema de confianza (CORE DEL SISTEMA)

El sistema calcula la fiabilidad de cada campo extraído.

### 10.1 Fórmula base

```
Confidence = w₁ × IA_model + w₂ × OCR + w₃ × rules + w₄ × coherence + w₅ × quality
```

Los pesos varían por tipo documental.

### 10.2 Pesos por tipo documental

| Tipo | IA_model | OCR | Rules | Coherence | Quality |
|------|----------|-----|-------|-----------|---------|
| **DNI** | 0.20 | 0.50 | 0.30 | - | - |
| **Factura** | 0.60 | 0.10 | 0.10 | 0.20 | - |
| **Contrato** | 0.70 | 0.10 | 0.10 | 0.10 | - |

### 10.3 Pesos configurables (NO hardcoded)

```json
{
  "DNI": {
    "ocr": 0.5,
    "rules": 0.3,
    "model": 0.2
  },
  "FACTURA": {
    "model": 0.6,
    "ocr": 0.1,
    "rules": 0.1,
    "coherence": 0.2
  }
}
```

Beneficios:
- Ajuste sin despliegue
- Personalización por cliente/país
- Experimentos A/B

### 10.4 Ajuste dinámico por histórico

El sistema ajusta pesos según rendimiento real observado.

**Ejemplo:**
- OCR en DNI: 98% precisión → peso ↑
- OCR en facturas: 72% precisión → peso ↓

```
peso_nuevo = peso_base × factor_rendimiento
```

## 11. Evolución del sistema (modelo avanzado)

### 11.1 Meta-modelo de confianza (ML Stacking)

En fase avanzada, el cálculo de confianza se sustituye por un modelo ML.

**Inputs (features):**
- confidence OCR
- confidence IA
- rule_score
- coherence_score
- document_quality
- document_type
- historical_corrections
- error_patterns

**Output:** `P(campo_correcto) ∈ [0, 1]`

Modelos candidatos: Logistic Regression, XGBoost, LightGBM

### 11.2 Learning from corrections

Cada corrección humana genera registro para mejora:

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

## 12. Relleno automático del expediente

| Confianza | Acción | Icono UI |
|-----------|--------|----------|
| ≥ 0.90 | Auto-fill sin marca | ✅ |
| 0.70 - 0.89 | Precarga con marca "Sugerido por IA" | ⚠️ |
| < 0.70 | Bloqueo + review obligatoria | ❌ |

## 13. Flujo del cliente

1. Sube documento(s)
2. Revisa precarga automática
3. Corrige campos si es necesario
4. Completa campos faltantes
5. Envía expediente

**Regla:** No se puede enviar si falta documentación obligatoria.

## 14. Flujo Ideauto

| Estado | Acción | Datos registrados |
|--------|--------|-------------------|
| **Revisado correcto** | Todo valido | usuario + timestamp |
| **Revisado corregido** | Campos subsanables | valores corregidos/campo |
| **Devuelto** | Falta documentación | motivo devolución |

**Importante:** No hay reentrenamiento en producción. Solo feedback analítico.

## 15. Feedback Loop

### Trazabilidad completa

Se registran eventos para análisis:

- Valores extraídos por IA
- Valores finales validados
- Correcciones humanas
- Confidence por campo
- Tipo de error detectado
- Metadata del documento

### Uso del feedback

- Análisis de errores por patrón
- Mejora de reglas de validación
- Ajuste de umbrales de confianza
- Retraining offline (fase futura)

## 16. Métricas del sistema

| Métrica | Fórmula | Target MVP |
|---------|---------|------------|
| **Precision** | TP / (TP + FP) | ≥ 90% |
| **Recall** | TP / (TP + FN) | ≥ 85% |
| **F1 Score** | 2 × (P × R) / (P + R) | ≥ 87% |

### Métricas operativas

- Coste medio por documento
- Tiempo medio de procesamiento (< 15s)
- Tasa de rechazo (< 5%)
- Tasa de corrección humana (< 30%)

## 17. Estados del expediente

| Estado | Descripción | Editable |
|--------|-------------|----------|
| **BORRADOR** | En edición por cliente | Sí |
| **ENVIADO** | Enviado a revisión | No |
| **EN REVISION IDEAUTO** | En proceso de validación | No |
| **APROBADO** | Validado correctamente | No |
| **DEVUELTO** | Requiere corrección documental | Sí |

## 18. Requisitos no funcionales

| Requisito | Valor |
|-----------|-------|
| Latencia | < 30 segundos |
| Disponibilidad | 99.5% |
| Compliance | RGPD compliant |
| Auditoría | Completa (100% eventos) |
| Escalabilidad | Horizontal (scale-out) |

## 19. Criterios de aceptación

| Código | Criterio |
|--------|----------|
| CA-01 | DQS ≥ 70 obligatorio para procesar |
| CA-02 | Accuracy ≥ 90% en documentos MVP |
| CA-03 | Confidence ≥ 95% en campos críticos |
| CA-04 | No envío sin documentación completa |
| CA-05 | Feedback obligatorio registrado |

---

## 🔚 CONCLUSIÓN

Esta arquitectura representa un sistema completo de automatización documental con:

- **Validación previa** (coste 0, filtro inteligente)
- **Routing optimizado** (economía de 40%)
- **Extracción híbrida** (OCR + DI + reglas)
- **Confidence evolutivo** (configurable → ML stacking)
- **Feedback real** (sin train en prod, análisis posterior)

---

### 📦 Entregables

| Documento | Estado |
|-----------|--------|
| MVP funcional | Semana 4 |
| Coste estimado | Ver hoja técnica |
| Roadmap evolución | Ver apartado 11 |