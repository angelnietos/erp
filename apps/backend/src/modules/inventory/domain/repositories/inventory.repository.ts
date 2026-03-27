import { Inventory } from '../entities/inventory.entity';
import { InventoryReservation } from '../entities/reservation.entity';
import { EntityId } from '@josanz-erp/shared-model';

export interface IInventoryRepository {
  findByProductId(productId: EntityId): Promise<Inventory | null>;
  save(inventory: Inventory): Promise<void>;
  
  // Reservations
  getOverlapReservations(productId: EntityId, startDate: Date, endDate: Date): Promise<InventoryReservation[]>;
  saveReservation(reservation: InventoryReservation): Promise<void>;
}

export const INVENTORY_REPOSITORY = Symbol('INVENTORY_REPOSITORY');
