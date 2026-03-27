import { DeliveryNote } from '../entities/delivery-note.entity';
import { EntityId } from '@josanz-erp/shared-model';

/**
 * Delivery Note Repository Port
 * Defines the contract for delivery note persistence
 */
export interface DeliveryRepositoryPort {
  /**
   * Find a delivery note by ID
   */
  findById(id: EntityId): Promise<DeliveryNote | null>;

  /**
   * Find delivery notes by budget ID
   */
  findByBudgetId(budgetId: EntityId): Promise<DeliveryNote[]>;

  /**
   * Find delivery notes by client ID
   */
  findByClientId(clientId: EntityId): Promise<DeliveryNote[]>;

  /**
   * Find all delivery notes
   */
  findAll(): Promise<DeliveryNote[]>;

  /**
   * Find delivery notes by status
   */
  findByStatus(status: string): Promise<DeliveryNote[]>;

  /**
   * Save a delivery note
   */
  save(deliveryNote: DeliveryNote): Promise<void>;

  /**
   * Delete a delivery note
   */
  delete(id: EntityId): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');