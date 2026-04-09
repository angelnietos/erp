import { Rental } from '../entities/rental.entity';
import { EntityId } from '@josanz-erp/shared-model';

/**
 * Rental Repository Port
 * Defines the contract for rental entity persistence
 */
export interface RentalRepositoryPort {
  // Rental operations
  findRentalById(id: EntityId): Promise<Rental | null>;
  findRentalByClientId(clientId: EntityId): Promise<Rental[]>;
  findRentalsByStatus(status: string): Promise<Rental[]>;
  findAllRentals(): Promise<Rental[]>;
  saveRental(rental: Rental): Promise<void>;
  deleteRental(id: EntityId): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const RENTAL_REPOSITORY = Symbol('RENTAL_REPOSITORY');
