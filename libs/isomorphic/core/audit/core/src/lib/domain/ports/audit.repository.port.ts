import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction, AuditEntity, AuditQuery } from '@josanz-erp/audit-api';
import { EntityId } from '@josanz-erp/shared-model';

export interface AuditRepositoryPort {
  save(auditLog: AuditLog): Promise<void>;
  findById(id: EntityId): Promise<AuditLog | null>;
  findByEntity(entity: AuditEntity, entityId: string): Promise<AuditLog[]>;
  findByUser(userId: EntityId, limit?: number): Promise<AuditLog[]>;
  query(query: AuditQuery): Promise<{ logs: AuditLog[]; total: number }>;
  findRecent(tenantId: EntityId, limit: number): Promise<AuditLog[]>;
}

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');
