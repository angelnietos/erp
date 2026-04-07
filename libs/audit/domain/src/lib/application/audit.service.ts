import { Inject, Injectable } from '@nestjs/common';
import { AuditLog } from '../domain/entities/audit-log.entity';
import {
  AUDIT_REPOSITORY,
  AuditRepositoryPort,
} from '../domain/ports/audit.repository.port';
import { AuditAction, AuditEntity, AuditQuery } from '@josanz-erp/audit-api';
import { EntityId } from '@josanz-erp/shared-model';

export interface CreateAuditLogDto {
  tenantId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: AuditRepositoryPort,
  ) {}

  async logActivity(dto: CreateAuditLogDto): Promise<AuditLog> {
    const changes =
      dto.oldValues && dto.newValues
        ? AuditLog.calculateChanges(dto.oldValues, dto.newValues)
        : undefined;

    const auditLog = AuditLog.create({
      tenantId: new EntityId(dto.tenantId),
      userId: new EntityId(dto.userId),
      userName: dto.userName,
      action: dto.action,
      entity: dto.entity,
      entityId: dto.entityId,
      entityName: dto.entityName,
      oldValues: dto.oldValues,
      newValues: dto.newValues,
      changes,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      details: dto.details,
    });

    await this.auditRepository.save(auditLog);
    return auditLog;
  }

  async getAuditLogById(id: string): Promise<AuditLog | null> {
    return this.auditRepository.findById(new EntityId(id));
  }

  async getEntityHistory(
    entity: AuditEntity,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditRepository.findByEntity(entity, entityId);
  }

  async getUserActivity(
    userId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditRepository.findByUser(new EntityId(userId), limit);
  }

  async queryAuditLogs(
    query: AuditQuery,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    // Convert string IDs to EntityId objects
    const processedQuery: AuditQuery = {
      ...query,
      tenantId: query.tenantId,
      userId: query.userId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    };

    return this.auditRepository.query(processedQuery);
  }

  async getRecentActivity(
    tenantId: string,
    limit: number = 20,
  ): Promise<AuditLog[]> {
    return this.auditRepository.findRecent(new EntityId(tenantId), limit);
  }

  // Helper method to create audit log for entity operations
  async logEntityOperation(
    tenantId: string,
    userId: string,
    userName: string,
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    entityName?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.logActivity({
      tenantId,
      userId,
      userName,
      action,
      entity,
      entityId,
      entityName,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  // Helper method for login/logout events
  async logAuthEvent(
    tenantId: string,
    userId: string,
    userName: string,
    action: 'LOGIN' | 'LOGOUT',
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.logActivity({
      tenantId,
      userId,
      userName,
      action,
      entity: 'USER',
      entityId: userId,
      entityName: userName,
      ipAddress,
      userAgent,
      details: `${action.toLowerCase()} event`,
    });
  }
}
