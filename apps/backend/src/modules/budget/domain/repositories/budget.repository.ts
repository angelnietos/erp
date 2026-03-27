import { Budget } from '../entities/budget.entity';
import { EntityId } from '@josanz-erp/shared-model';

/**
 * Port (interface) for the Budget repository.
 * Infrastructure adapters (Prisma) implement this; the domain only depends on this contract.
 */
export interface IBudgetRepository {
  findById(id: EntityId): Promise<Budget | null>;
  findAll(clientId?: EntityId): Promise<Budget[]>;
  save(budget: Budget): Promise<void>;
  delete(id: EntityId): Promise<void>;
}

export const BUDGET_REPOSITORY = Symbol('BUDGET_REPOSITORY');


