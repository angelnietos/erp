import { AggregateRoot, EntityId } from '@josanz-erp/shared-model';
import { AuditAction, AuditEntity } from '@josanz-erp/audit-api';

export interface AuditLogProps {
  tenantId: EntityId;
  userId: EntityId;
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
  timestamp: Date;
  details?: string;
}

export class AuditLog extends AggregateRoot {
  readonly id: EntityId;
  private props: AuditLogProps;

  private constructor(id: EntityId, props: AuditLogProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(props: Omit<AuditLogProps, 'timestamp'>): AuditLog {
    const id = new EntityId();
    return new AuditLog(id, {
      ...props,
      timestamp: new Date(),
    });
  }

  static reconstitute(id: string, props: AuditLogProps): AuditLog {
    return new AuditLog(new EntityId(id), props);
  }

  get tenantId(): EntityId {
    return this.props.tenantId;
  }

  get userId(): EntityId {
    return this.props.userId;
  }

  get userName(): string {
    return this.props.userName;
  }

  get action(): AuditAction {
    return this.props.action;
  }

  get entity(): AuditEntity {
    return this.props.entity;
  }

  get entityId(): string {
    return this.props.entityId;
  }

  get entityName(): string | undefined {
    return this.props.entityName;
  }

  get oldValues(): Record<string, any> | undefined {
    return this.props.oldValues;
  }

  get newValues(): Record<string, any> | undefined {
    return this.props.newValues;
  }

  get changes(): Record<string, { old: any; new: any }> | undefined {
    return this.props.changes;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get details(): string | undefined {
    return this.props.details;
  }

  // Helper method to calculate changes between old and new values
  static calculateChanges(
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    const allKeys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {}),
    ]);

    for (const key of allKeys) {
      const oldValue = oldValues?.[key];
      const newValue = newValues?.[key];

      // Deep comparison for objects/arrays, simple comparison for primitives
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    }

    return changes;
  }
}
