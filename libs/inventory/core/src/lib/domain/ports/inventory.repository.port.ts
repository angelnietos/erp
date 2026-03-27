import { EntityId } from '@josanz-erp/shared-model';
import { Inventory } from '../entities/inventory.entity';
import { InventoryReservation } from '../entities/reservation.entity';

export interface InventoryRepositoryPort {
  findByProductId(productId: EntityId): Promise<Inventory | null>;
  save(inventory: Inventory): Promise<void>;
  getOverlapReservations(productId: EntityId, startDate: Date, endDate: Date): Promise<InventoryReservation[]>;
  saveReservation(reservation: InventoryReservation): Promise<void>;
}

export const INVENTORY_REPOSITORY = Symbol('INVENTORY_REPOSITORY');

