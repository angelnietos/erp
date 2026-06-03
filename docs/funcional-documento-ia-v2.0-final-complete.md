# Plataforma CAE v2.0 – Documento Técnico Completo
**Definición Funcional y Arquitectónica – Ideauto**  
Fecha: 1 Junio 2026 | Versión: 2.0

---

## 0. Resumen Ejecutivo

Plataforma de automatización documental con IA híbrida (OCR + Document Intelligence + Rules Engine) y sistema evolutivo de confidence scoring, sobre arquitectura Azure segura y escalable.

**KPIs MVP:**
- Precisión ≥ 90% | Recall ≥ 85%
- Tiempo procesamiento < 15s
- Reducción manual 70%
- Coste optimizado (routing inteligente)

---

## 1. Alcance del Proyecto

### Incluye
- ✔ Módulo de Expedientes (único afectado)
- ✔ Procesamiento documental automático
- ✔ Extracción estructurada de datos
- ✔ Validación de negocio (reglas)
- ✔ Sistema de confidence y scoring
- ✔ Revisión humana controlada (cliente/Ideauto)
- ✔ Trazabilidad completa

### Excluye
- ✖ Gestión de usuarios
- ✖ Módulos administrativos
- ✖ Entrenamiento en producción

---

## 2. Pipeline de IA (Arquitectura Real)

```
Cliente Upload
    ↓
API Gateway → Blob Storage → Service Bus Queue
    ↓
Azure Function → Quality Gate (DQS) → Classification
    ↓
Routing Engine
┌─────────────┬─────────────┬──────────────┐
│   OCR       │  Document   │  Multimodal  │
│  (DNI)      │ Intelligenc │  (Contratos) │
└─────────────┴─────────────┴──────────────┘
    ↓
Normalization → Rules Engine → Confidence Engine
    ↓
Decision Engine (Auto-fill / Review / Block)
    ↓
SQL Database ← Event Logging ← App Insights
```

---

## 3. Fases Técnicas del Pipeline

| Fase | Descripción | Validación |
|------|-------------|------------|
| **1. Upload** | Cliente sube PDF/imagen | API Gateway valida JWT |
| **2. Quality Gate** | DQS: resolución, calidad, formato | Score 0-100, rechaza <50 |
| **3. Classification** | Identifica tipo documento | Prebuilt models |
| **4. Routing** | Selecciona tecnología óptima | OCR/DI/Multimodal |
| **5. Extraction** | OCR + key-value pairs | Output estructurado |
| **6. Normalization** | Mapeo a modelo interno | Limpieza, formatos |
| **7. Rules** | Reglas de negocio | Regex, coherencia |
| **8. Confidence** | Scoring híbrido | Ponderado configurable |
| **9. Decision** | Auto/reject/review | Umbrales 90/70 |
| **10. Persist** | SQL con trazabilidad | Todos los valores |
| **11. Logging** | Evento completo | Correlation ID |

---

## 4. Sistema de Confidence (CORE TÉCNICO)

### 4.1 Fórmula Híbrida (Fase 1)

```
Confidence = w₁ × DI_conf + w₂ × OCR + w₃ × Rules + w₄ × Quality
```

### 4.2 Pesos por Tipo Documental

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
  }
}
```

### 4.3 Document Quality Score (DQS)

```
DQS = 25% legibilidad + 20% resolución + 20% densidad texto 
      + 15% ausencia ruido + 20% estructura detectada
```

### 4.4 Evolución del Sistema

**Fase 1 (Actual):** Pesos estáticos configurable  
**Fase 2:** Meta-modelo ML (stacking) - Logistic Regression/XGBoost  
**Fase 3:** Ajuste dinámico + Learning from corrections

---

## 5. Flujos de Negocio

### 5.1 Flujo Cliente

1. Crea expediente
2. Sube documentos
3. IA precarga formulario
4. Revisa/corrige campos
5. Envía a revisión
6. Expediente bloqueado

### 5.2 Flujo Ideauto

| Acción | Cuándo | Datos registrados |
|--------|--------|-----------------|
| **Aprobado** | Todo correcto | usuario + timestamp |
| **Corregido** | Campos subsanables | valores corregidos/campo |
| **Devuelto** | Falta documentación | motivo devolución |

---

## 6. Seguridad del Sistema

### 6.1 Autenticación y Autorización

- **SSO/OIDC:** Azure AD B2C o IdP externo
- **Tokens JWT:** API Gateway valida firmas
- **RBAC:** Roles cliente/Ideauto/admin
- **mTLS:** Comunicación interna Functions

### 6.2 Seguridad de Datos

- **TLS 1.3:** Todas comunicaciones
- **Cifrado reposo:** TDE SQL, SSE Blob
- **Key Vault:** Rotación credenciales automática
- **Anonimización:** Campos sensibles tokenizados

### 6.3 Seguridad de Infraestructura

- **VNet aislado:** Subredes con NSGs
- **WAF:** Protección OWASP Top 10
- **Private Endpoints:** Sin exposición pública
- **MFA:** Acceso administrativo obligatorio

---

## 7. Monitorización y Logging

### 7.1 Métricas Clave

| Tipo | Herramienta | Métricas |
|------|-------------|----------|
| **Infra** | App Insights | CPU, memory, queue time |
| **Aplicación** | App Insights | Latencia, errores, throughput |
| **IA** | Custom metrics | Precision, recall, F1 |
| **Negocio** | Logs | Docs procesados, errores, tiempos |

### 7.2 Trazabilidad

- Structured logging JSON
- Correlation ID en todo flujo
- Retención logs 2 años
- Auditoría completa

---

## 8. Escalabilidad y Resiliencia

### 8.1 Escalabilidad Horizontal

- **Functions:** Scale-out por queue depth
- **Service Bus:** Auto-scaling partitions
- **SQL:** Read replicas
- **Cache:** Redis para metadata

### 8.2 Alta Disponibilidad

- **Multi-AZ:** Blob + SQL replicación geográfica
- **Retry policies:** Exponential backoff
- **Circuit breaker:** Llamadas externas
- **Graceful degradation:** Fallback OCR

### 8.3 Backup/Restore

- **SQL:** PITR 35 días + snapshots
- **Blob:** Versionado + Soft Delete 90 días
- **DR:** Geo-restore región secundaria

---

## 9. Coste Estimado (MVP)

| Volumen | Coste mensual |
|---------|---------------|
| 10K docs | ~250€ |
| 50K docs | ~950€ |
| 100K docs | ~1,800€ |

**Optimización:** Routing inteligente (-35% coste DI)