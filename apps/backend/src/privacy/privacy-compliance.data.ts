/** ROPA estructurado — fuente para API y UI de cumplimiento. */
export interface RopaTreatmentRow {
  id: string;
  name: string;
  purpose: string;
  dataCategories: string[];
  lawfulBasis: string;
  retentionDays: number | null;
  technicalMeasures: string[];
}

export interface RopaDocumentDto {
  version: string;
  updatedAt: string;
  dpoContact: string;
  treatments: RopaTreatmentRow[];
  dataSubjectRights: { right: string; implementation: string }[];
  markdownPath: string;
}

export interface DpiaRiskRow {
  id: string;
  description: string;
  probability: string;
  impact: string;
  level: string;
  mitigation: string;
  status: 'implemented' | 'planned' | 'recurrent';
}

export interface DpiaDocumentDto {
  version: string;
  updatedAt: string;
  conclusion: string;
  acceptable: boolean;
  risks: DpiaRiskRow[];
  actionPlan: { action: string; priority: string; deadline: string; status: string }[];
  markdownPath: string;
}

export const ROPA_TREATMENTS: RopaTreatmentRow[] = [
  {
    id: 'T-01',
    name: 'Usuarios e identidad',
    purpose: 'Autenticación, RBAC/ABAC, operación ERP',
    dataCategories: ['Email', 'Nombre', 'Roles', 'Hash contraseña'],
    lawfulBasis: 'Contrato (6.1.b) · Interés legítimo seguridad (6.1.f)',
    retentionDays: null,
    technicalMeasures: ['JWT/BFF HttpOnly', 'Redis sesiones opcional', 'Auditoría'],
  },
  {
    id: 'T-02',
    name: 'CRM / Clientes',
    purpose: 'Relación comercial, presupuestos, proyectos',
    dataCategories: ['NIF/CIF', 'Email', 'Teléfono', 'Dirección', 'Contactos'],
    lawfulBasis: 'Contrato (6.1.b) · Interés legítimo (6.1.f)',
    retentionDays: null,
    technicalMeasures: [
      'AES-256-GCM en reposo',
      'Enmascaramiento API',
      'Export RGPD admin',
      'Cola DPO borrado',
    ],
  },
  {
    id: 'T-03',
    name: 'Facturación / Verifactu',
    purpose: 'Cumplimiento fiscal Ley Antifraude',
    dataCategories: ['Datos fiscales', 'Líneas factura', 'Huellas encadenadas'],
    lawfulBasis: 'Obligación legal (6.1.c)',
    retentionDays: 2555,
    technicalMeasures: ['Integridad hash', 'Secretos webhook cifrados', 'Legal hold erasure'],
  },
  {
    id: 'T-04',
    name: 'Auditoría',
    purpose: 'Trazabilidad ISO 27001',
    dataCategories: ['userId', 'IP', 'User-agent', 'Acciones'],
    lawfulBasis: 'Interés legítimo (6.1.f)',
    retentionDays: 730,
    technicalMeasures: ['AuditInterceptor global', 'Purga automática semanal'],
  },
  {
    id: 'T-05',
    name: 'Telemetría IA',
    purpose: 'Mejora asistentes y KPIs',
    dataCategories: ['Resúmenes chat', 'sessionId', 'Metadata'],
    lawfulBasis: 'Interés legítimo (6.1.f)',
    retentionDays: 365,
    technicalMeasures: ['Anonimización self-service', 'Cola DPO', 'Redacción PII logs'],
  },
  {
    id: 'T-06',
    name: 'Webhooks / integraciones',
    purpose: 'Notificaciones Verifactu y domain events',
    dataCategories: ['URLs', 'Payloads evento', 'Secretos HMAC'],
    lawfulBasis: 'Contrato / interés legítimo',
    retentionDays: 365,
    technicalMeasures: ['Cifrado secretos', 'No listar secretos', 'Rotación'],
  },
];

export const ROPA_RIGHTS = [
  { right: 'Acceso (art. 15)', implementation: 'Export JSON self-service y admin' },
  { right: 'Rectificación (art. 16)', implementation: 'Módulos CRM e Identidad' },
  { right: 'Supresión (art. 17)', implementation: 'Cola DPO con legal hold fiscal' },
  { right: 'Portabilidad (art. 20)', implementation: 'Export JSON' },
  { right: 'Oposición (art. 21)', implementation: 'Contacto DPO' },
];

export const DPIA_RISKS: DpiaRiskRow[] = [
  {
    id: 'R1',
    description: 'Acceso no autorizado a PII CRM',
    probability: 'Media',
    impact: 'Alto',
    level: 'Alto',
    mitigation: 'RBAC + pii.view_unmasked + cifrado DB',
    status: 'implemented',
  },
  {
    id: 'R2',
    description: 'Pérdida clave PII_ENCRYPTION_KEY',
    probability: 'Baja',
    impact: 'Muy alto',
    level: 'Alto',
    mitigation: 'Key Vault / env gestionado, rotación documentada',
    status: 'planned',
  },
  {
    id: 'R4',
    description: 'Telemetría IA re-identificable',
    probability: 'Media',
    impact: 'Medio',
    level: 'Medio',
    mitigation: 'Anonimización + retención 365d',
    status: 'implemented',
  },
  {
    id: 'R6',
    description: 'Supresión indebida datos fiscales',
    probability: 'Baja',
    impact: 'Muy alto',
    level: 'Alto',
    mitigation: 'Legal hold + workflow DPO',
    status: 'implemented',
  },
];

export const DPIA_ACTION_PLAN = [
  {
    action: 'PII_ENCRYPTION_KEY en producción',
    priority: 'Alta',
    deadline: 'Pre-go-live',
    status: 'Pendiente ops',
  },
  {
    action: 'DPA subencargados firmados',
    priority: 'Alta',
    deadline: 'Pre-go-live',
    status: 'Pendiente legal',
  },
  {
    action: 'Revisión permisos pii.view_unmasked',
    priority: 'Media',
    deadline: 'Trimestral',
    status: 'Recurrente',
  },
];
