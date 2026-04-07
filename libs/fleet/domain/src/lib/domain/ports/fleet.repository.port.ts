
import { Driver } from '../entities/driver.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { EntityId } from '@josanz-erp/shared-model';

/**
 * Fleet Repository Port
 * Defines the contract for fleet entity persistence
 */
export interface FleetRepositoryPort {
  // Vehicle operations
  findVehicleById(id: EntityId): Promise<Vehicle | null>;
  findVehicleByPlate(plate: string): Promise<Vehicle | null>;
  findAllVehicles(): Promise<Vehicle[]>;
  findVehiclesByStatus(status: string): Promise<Vehicle[]>;
  saveVehicle(vehicle: Vehicle): Promise<void>;
  deleteVehicle(id: EntityId): Promise<void>;

  // Driver operations
  findDriverById(id: EntityId): Promise<Driver | null>;
  findDriverByEmployeeId(employeeId: string): Promise<Driver | null>;
  findDriverByNif(nif: string): Promise<Driver | null>;
  findAllDrivers(): Promise<Driver[]>;
  findDriversByStatus(status: string): Promise<Driver[]>;
  saveDriver(driver: Driver): Promise<void>;
  deleteDriver(id: EntityId): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const FLEET_REPOSITORY = Symbol('FLEET_REPOSITORY');
