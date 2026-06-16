# Registro de Actividades de Tratamiento (ROPA)

**Responsable del tratamiento:** Josanz ERP (tenant configurado por cada cliente SaaS)  
**Versión:** 2026-06  
**Normativa:** RGPD art. 30 · ISO/IEC 27001 Anexo A.5.34  
**Contacto DPO:** ver variable `DPO_CONTACT_EMAIL` / Configuración → Seguridad y privacidad

---

## 1. Finalidad del registro

Este documento cumple el **art. 30 RGPD**: inventario de tratamientos de datos personales en la plataforma Josanz ERP, incluyendo medidas técnicas implementadas en código (cifrado, enmascaramiento, auditoría, cola DPO).

---

## 2. Tratamientos

### T-01 — Gestión de usuarios e identidad

| Campo | Valor |
|-------|--------|
| **Finalidad** | Autenticación, autorización RBAC/ABAC, operación del ERP |
| **Categorías de interesados** | Empleados, técnicos, administradores del tenant |
| **Categorías de datos** | Nombre, email, contraseña (hash), roles, permisos, tenantId |
| **Base jurídica** | Ejecución de contrato (art. 6.1.b) · Interés legítimo seguridad (art. 6.1.f) |
| **Plazo de conservación** | Duración relación laboral/contractual + 30 días post-baja lógica |
| **Medidas técnicas** | JWT/BFF HttpOnly, Redis sesiones opcional, hash local, auditoría |

### T-02 — CRM / Clientes

| Campo | Valor |
|-------|--------|
| **Finalidad** | Relación comercial, presupuestos, proyectos, alquileres |
| **Datos** | NIF/CIF, email, teléfono, dirección, contactos, notas |
| **Base jurídica** | Contrato (6.1.b) · Interés legítimo comercial (6.1.f) |
| **Medidas técnicas** | AES-256-GCM en reposo, enmascaramiento API, export RGPD admin, cola DPO |

### T-03 — Facturación y Verifactu

| Campo | Valor |
|-------|--------|
| **Finalidad** | Emisión facturas, cumplimiento Ley Antifraude / Verifactu |
| **Base jurídica** | Obligación legal (6.1.c) — conservación mínima 6 años (ES) |
| **Conservación** | 2555 días — no suprimible por erasure estándar |
| **Medidas técnicas** | Integridad hash, cola Verifactu, secretos webhook cifrados |

### T-04 — Auditoría · T-05 — Telemetría IA · T-06 — Webhooks

Ver documento completo en API `GET /api/privacy/ropa` y [README](./README.md).

---

## 3. Derechos del interesado

| Derecho | Implementación |
|---------|----------------|
| Acceso (art. 15) | Export JSON self-service y admin |
| Supresión (art. 17) | Cola DPO con legal hold facturas |
| Portabilidad (art. 20) | Export JSON |

**Revisión:** semestral · **Próxima:** 2026-12
