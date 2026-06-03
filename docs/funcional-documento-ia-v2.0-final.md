# Plataforma CAE v2.0 – Desarrollo IA
**Ideauto** | Definición Funcional | 1 Junio 2026

---

## Datos Cliente
**INSTITUTO DE ESTUDIOS DE AUTOMOCIÓN S.L.**  
C/ OQUENDO 23  
28006 - Madrid  
B82101809

---

## 1. Descripción Funcional

### 1.1 Funcionamiento de la IA

#### 1.1.1 Funcionamiento propuesto
El sistema procesa documentos PDF e imágenes para extraer información estructurada y volcarla en el expediente correspondiente. Integra tres capas técnicas:

| Capa | Tecnología | Objetivo |
|------|------------|----------|
| **Extracción** | Azure Document Intelligence | OCR + extracción estructurada de campos |
| **Validación** | Rules Engine | Reglas de negocio y coherencia de datos |
| **Confianza** | Confidence Engine | Scoring probabilístico por campo |

**Alcance funcional:**
- ✔ Módulo de Expedientes (único afectado)
- ✔ Procesamiento documental automático
- ✔ Extracción y validación de datos
- ✔ Revisión cliente / Ideauto
- ✔ Trazabilidad y feedback

- ✖ Gestión de usuarios
- ✖ Entrenamiento de modelos en producción

#### 1.1.2 Pipeline de IA (arquitectura real)

```
Upload → Validación → Document Intelligence → Normalización → Rules Engine → Confidence → Decisión → Persistencia → Logging
```

| Paso | Acción | Responsable |
|------|--------|-------------|
| 1 | Upload documento PDF/imagen | Cliente |
| 2 | Validación formato + calidad básica | Sistema |
| 3 | Identificación tipo documento | IA (prebuilt models) |
| 4 | OCR + extracción campos estructurados | Document Intelligence |
| 5 | Normalización a modelo interno | Sistema |
| 6 | Aplicación reglas de negocio | Rules Engine |
| 7 | Cálculo confidence por campo | Confidence Engine |
| 8 | Decisión automática (auto-fill/review/blocked) | Sistema |
| 9 | Precarga formulario expediente | Sistema |
| 10 | Revisión cliente | Cliente |
| 11 | Envío a Ideauto | Cliente |
| 12 | Revisión Ideauto | Ideauto |

### 1.2 Flujo del Cliente - Edición del expediente

#### 1.2.1 Descripción general
Al crear un expediente, el cliente sube documentación. El sistema procesa automáticamente y precarga los campos del formulario. El cliente revisa, corrige y envía a revisión. Una vez enviado, el expediente queda bloqueado.

#### 1.2.2 Estados del expediente

| Estado | Descripción | Editable |
|--------|-------------|----------|
| **BORRADOR** | Expediente en creación por cliente | Sí |
| **ENVIADO** | Enviado a revisión | No |
| **EN REVISION IDEAUTO** | En proceso de validación | No |
| **APROBADO** | Validado correctamente | No |
| **DEVUELTO** | Requiere corrección documental | Sí |

### 1.3 Flujo de Ideauto - Revisión del expediente

#### 1.3.1 Descripción general
Ideauto valida información y documentación. Puede aprobar, corregir o devolver el expediente.

#### 1.3.2 Acciones de revisión

| Acción | Cuándo aplicar | Datos registrados | Efecto |
|--------|---------------|-------------------|--------|
| **Revisado correcto** | Todo valido | usuario + timestamp | Cierre y envío |
| **Revisado corregido** | Campos incorrectos subsanables | valores corregidos por campo | Cierre + feedback IA |
| **Devuelto** | Falta documentación | motivo devolución | Vuelve al cliente |

#### 1.3.3 Flujo detallado — "Revisado corregido"
1. Sistema resalta campos con confianza baja o modificados por cliente
2. Ideauto edita valores incorrectos directamente
3. Se registra: valor IA → valor cliente → valor corregido → usuario/timestamp
4. Expediente se marca como aprobado
5. Correcciones se envían al pipeline de feedback

### 1.4 Trazabilidad y Feedback

#### 1.4.1 Datos registrados por expediente
- Valores extraídos por IA
- Valores finales validados
- Correcciones humanas
- Confidence por campo
- Tipo de error detectado

#### 1.4.2 Uso del feedback
El feedback **NO entrena modelos en producción**. Se utiliza para:
- Análisis de errores
- Mejora de reglas de validación
- Ajuste de umbrales de confianza
- Retraining offline (fase futura)

---

## 2. Planteamiento técnico del proyecto

### 2.1 Arquitectura funcional propuesta

```
Frontend → API Gateway → Blob Storage → Service Bus → Azure Functions 
                                    ↓
                       Document Intelligence → Rules Engine → Confidence Engine → SQL Database → App Insights
```

### 2.2 Desglose del pipeline

| Fase | Descripción técnica |
|------|---------------------|
| **1. Upload** | Cliente sube documento → Blob Storage → se genera DocumentId único |
| **2. Validación inicial** | Formato (PDF/JPG/PNG), tamaño (<15MB), calidad (resolución mínima, contenido detectable) |
| **3. Document Intelligence** | OCR + extracción con prebuilt models (DNI, invoices, forms) o general document model |
| **4. Normalización** | Transformación a modelo interno homogéneo (limpieza, trim, formatos) |
| **5. Rules Engine** | Validación estructural (regex DNI, VIN 17 chars, fechas coherentes) y cruzada |
| **6. Confidence Engine** | Cálculo: `confidence = f(DI_confidence, rule_score, document_quality)` |
| **7. Decisión automática** | Auto-fill (≥0.90), Review (0.70-0.90), Blocked (<0.70) |
| **8. Persistencia** | Guardado en SQL con valores, confidence, estado, versión modelo |
| **9. Logging** | Evento completo para auditoría, métricas y feedback |

### 2.3 Fases de implantación

| Fase | Alcance | Timeline estimado |
|------|---------|-------------------|
| **Fase 1 – MVP** | DNI + documento base, pipeline completo, confidence engine inicial | 2 semanas |
| **Fase 2 – Expansión** | Nuevos tipos documento, reglas mejoradas, optimización extracción | 3 semanas |
| **Fase 3 – Optimización** | Confidence dinámico, reducción intervención humana, precisión avanzada | 4 semanas |
| **Fase 4 – Escalabilidad** | Batch processing, optimización costes, alta carga | 5 semanas |

---

## 3. Tecnologías propuestas

| Capa | Servicio Azure |
|------|----------------|
| **Storage** | Azure Blob Storage |
| **Messaging** | Azure Service Bus |
| **Compute** | Azure Functions |
| **AI/ML** | Azure Document Intelligence |
| **Database** | Azure SQL Database |
| **Monitoring** | Application Insights |
| **Fallback (opcional)** | Azure OpenAI |

---

## Conclusiones

La arquitectura propuesta garantiza:
- **Reducción 70% tiempo manual** en cumplimentación de expedientes
- **Trazabilidad completa** de cada decisión de IA
- **Control de calidad** mediante reglas y confidence scoring
- **Escalabilidad** basada en servicios serverless