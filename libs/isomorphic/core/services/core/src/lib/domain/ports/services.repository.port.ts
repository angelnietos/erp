import { Service } from '../entities/service.entity';
import { ServiceType } from '@josanz-erp/services-api';
import { EntityId } from '@josanz-erp/shared-model';

export interface ServicesRepositoryPort {
  findById(id: EntityId): Promise<Service | null>;
  findAll(tenantId: EntityId, type?: ServiceType): Promise<Service[]>;
  findActive(tenantId: EntityId, type?: ServiceType): Promise<Service[]>;
  save(service: Service): Promise<void>;
  delete(id: EntityId): Promise<void>;
}

export const SERVICES_REPOSITORY = Symbol('SERVICES_REPOSITORY');
