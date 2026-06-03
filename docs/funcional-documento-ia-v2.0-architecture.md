# Plataforma CAE v2.0 – Automatización Inteligente de Expedientes (IA)
**Definición Funcional y Arquitectónica – Ideauto**  
Fecha: 1 Junio 2026 | Versión: 2.0

---

## 0. Resumen Ejecutivo

La Plataforma CAE v2.0 automatiza la gestión documental mediante un pipeline de IA híbrido (OCR + Document Intelligence + Rules Engine) con sistema evolutivo de confidence scoring, integrado en una arquitectura Azure segura y escalable.

**KPIs MVP:**
- Precisión ≥ 90%
- Tiempo procesamiento < 15s
- Reducción manual 70%
- Coste optimizado (routing inteligente)

---

## 1. Arquitectura del Sistema

### 1.1 Pipeline de IA (flujo técnico)

```
Cliente Upload
    ↓
API Gateway → Blob Storage → Service Bus Queue
    ↓
Azure Function Orchestrator → Quality Gate (DQS)
    ↓
Document Classification → Routing Engine
    ↓
┌─────────────┬─────────────┬──────────────┐
│   OCR       │  Document   │  Multimodal  │
│  (DNI)      │ Intelligenc │  (Contratos) │
│             │ (Facturas)  │              │
└─────────────┴─────────────┴──────────────┘
    ↓
Data Normalization → Rules Engine → Confidence Engine
    ↓
Decision Engine (Auto-fill / Review / Block)
    ↓
SQL Database ← Event Logging
```

### 1.2 Stack tecnológico

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

## 2. Flujo del Cliente

### 2.1 Proceso

1. Cliente crea expediente
2. Subida documental (PDF/imagen)
3. Precarga automática formulario (IA)
4. Revisión y corrección cliente
5. Envío a revisión Ideauto
6. Bloqueo edición (estado ENVIADO)

### 2.2 Estados del expediente

| Estado | Descripción | Editable |
|--------|-------------|----------|
| **BORRADOR** | Creación cliente | Sí |
| **ENVIADO** | Pendiente revisión | No |
| **EN REVISION IDEAUTO** | En proceso interno | No |
| **APROBADO** | Validado | No |
| **DEVUELTO** | Requiere corrección | Sí |

---

## 3. Sistema de Confidence (evolutivo)

### 3.1 Fórmula base (Fase 1)

```
Confidence = w₁ × DI_conf + w₂ × OCR + w₃ × Rules + w₄ × Quality
```

### 3.2 Pesos configurables por documento

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

### 3.3 Evolución futura

**Fase 2:** Meta-modelo ML (stacking) - Logistic Regression/XGBoost  
**Fase 3:** Learning from corrections - feedback loop sin retrain en prod

---

## 4. Seguridad

### 4.1 Autenticación y Autorización

- **SSO/OIDC:** Azure AD B2C o integración con IdP cliente
- **Tokens JWT:** Emisión y validación en API Gateway
- **RBAC:** Roles cliente/usuario/Ideauto con permisos granulares
- **mTLS:** Comunicación interna Functions → Services

### 4.2 Seguridad de Datos

- **TLS 1.3:** Todas las comunicaciones
- **Cifrado en reposo:** TDE en SQL, SSE en Blob Storage
- **Key Vault:** Rotación automática de credenciales
- **Anonimización:** Campos sensibles tokenizados

### 4.3 Seguridad de Infraestructura

- **VNet aislado:** Subredes con NSGs restringidas
- **WAF:** Protección OWASP Top 10 en API Management
- **Private Endpoints:** Sin exposición pública de servicios
- **MFA obligatoria:** Acceso administrativo

---

## 5. Monitorización y Logging

### 5.1 Métricas clave

| Tipo | Herramienta | Métrica |
|------|-------------|---------|
| **Infra** | App Insights | CPU, memory, queue time |
| **Aplicación** | App Insights | Latencia endpoint, errores |
| **IA** | Custom metrics | Accuracy, precision, recall |
| **Negocio** | Logs | Documentos procesados, errores |

### 5.2 Logging y trazabilidad

- **Structured logging:** JSON con correlation ID
- **Log Analytics:** Consultas KQL para auditoría
- **Alertas:** Umbral errores >1%, latencia >30s
- **Retención:** Logs 2 años (requisitos legales)

---

## 6. Escalabilidad

### 6.1 Horizontal

- **Functions:** Scale-out automático por queue depth
- **Service Bus:** Auto-scaling partitions
- **SQL:** Read replicas para consultas
- **Redis Cache (opcional):** Para metadata frecuente

### 6.2 Vertical

- **SQL Database:** Up-scaling en horas punta
- **Functions Premium:** Mayor memoria/ejecución

---

## 7. Resiliencia y Recuperación

### 7.1 Alta disponibilidad

- **Multi-AZ:** Blob + SQL con replicación geográfica
- **Retry policies:** Exponential backoff en Service Bus
- **Circuit breaker:** Política en llamadas externas
- **Graceful degradation:** Fallback OCR si DI falla

### 7.2 Backup/Restore

- **SQL:** PITR 35 días + snapshots semanales
- **Blob:** Versionado + Soft Delete 90 días
- **Disaster Recovery:** Geo-restore en región secundaria

---

## 8. Consideraciones de Coste

### 8.1 Optimización activa

| Estrategia | Ahorro estimado |
|------------|-----------------|
| **Routing inteligente** | -35% coste DI |
| **Quality Gate** | -15% rechazos tempranos |
| **Caching metadata** | -20% SQL queries |

### 8.2 Modelo de coste MVP (ejemplo)

| Volumen | Coste mensual estimado |
|---------|----------------------|
| 10K documentos/mes | ~250€ (DI + Functions + Storage) |
| 50K documentos/mes | ~950€ |
| 100K documentos/mes | ~1,800€ |

---

## 9. Roadmap

| Fase | Duración | Feature |
|------|----------|---------|
| **1 - MVP** | 4 semanas | DNI + facturas, confidence básico |
| **2 - Expansión** | 3 semanas | Nuevos tipos, reglas avanzadas |
| **3 - Optimización** | 4 semanas | ML confidence, reducción review |
| **4 - Escalabilidad** | 5 semanas | Batch, coste optimizado |

---

## 10. Glosario

 - **AI Confidence:** Probabilidad de corrección de campo
 - **DQS:** Document Quality Score
 - **Quality Gate:** Filtro previo de calidad documento
 - **Auto-fill:** Relleno automático sin review
 - **Review/Bloqueo:** Precarga con marca o bloqueo obligatorio

---

## 11. Referencias

- [Azure Architecture Center](https://docs.microsoft.com/azure/architecture/)
- [OWASP Top 10](https://owasp.org/Top10/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)