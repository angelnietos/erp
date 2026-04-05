export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT';

export type AuditEntity =
  | 'USER'
  | 'PROJECT'
  | 'SERVICE'
  | 'EVENT'
  | 'CLIENT'
  | 'INVOICE'
  | 'RECEIPT'
  | 'EQUIPMENT';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: string;
}

export interface AuditQuery {
  tenantId?: string;
  userId?: string;
  action?: AuditAction;
  entity?: AuditEntity;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}
