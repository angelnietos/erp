# Evaluación de Impacto en Protección de Datos (DPIA)

**Sistema:** Josanz ERP · **Versión:** 2026-06 · **Normativa:** RGPD art. 35

---

## 1. Tratamientos evaluados

- **T-02 CRM PII** — Alto riesgo por volumen fiscal/contacto
- **T-05 Telemetría IA** — Riesgo inferencia comportamental
- **T-03 Verifactu** — Obligación legal; minimización en webhooks

## 2. Riesgos y mitigaciones

| ID | Riesgo | Mitigación | Estado |
|----|--------|------------|--------|
| R1 | Acceso no autorizado PII | RBAC + cifrado + enmascaramiento | ✅ |
| R2 | Pérdida clave cifrado | Key Vault producción | Pendiente ops |
| R6 | Supresión indebida fiscal | Legal hold + DPO workflow | ✅ |

## 3. Dictamen

Tratamiento **ADMISIBLE** con controles implementados. Revisión semestral.

Detalle completo: `GET /api/privacy/dpia` · [ROPA](./ROPA.md)
