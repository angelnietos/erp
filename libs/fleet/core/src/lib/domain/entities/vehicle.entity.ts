import { AggregateRoot, EntityId } from '@josanz-erp/shared-model';

/**
 * Vehicle Status
 */
export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

/**
 * Vehicle Type
 */
export type VehicleType = 'VAN' | 'TRUCK' | 'CAR' | 'MOTORCYCLE';

/**
 * Vehicle Props
 */
export interface VehicleProps {
  plate: string;
  brand: string;
  model: string;
  type: VehicleType;
  capacity: number;
  year: number;
  status: VehicleStatus;
  mileage: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  insuranceExpiry: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vehicle Entity
 * Represents a vehicle in the ERP fleet management
 */
export class Vehicle extends AggregateRoot {
  readonly id: EntityId;
  private readonly props: VehicleProps;

  private constructor(id: EntityId, props: VehicleProps) {
    super();
    this.id = id;
    this.props = props;
  }

  /**
   * Create a new vehicle
   */
  static create(
    plate: string,
    brand: string,
    model: string,
    type: VehicleType,
    capacity: number,
    year: number,
    insuranceExpiry: Date,
  ): Vehicle {
    if (!this.isValidPlate(plate)) {
      throw new Error('Invalid license plate format');
    }
    const id = new EntityId();
    const now = new Date();
    return new Vehicle(id, {
      plate: plate.toUpperCase(),
      brand,
      model,
      type,
      capacity,
      year,
      status: 'AVAILABLE',
      mileage: 0,
      insuranceExpiry,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Validate Spanish license plate format
   */
  private static isValidPlate(plate: string): boolean {
    // Spanish plates: 4 digits + 3 letters or old format (1-2 letters + 4 digits)
    const newFormat = /^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/i;
    const oldFormat = /^[A-Z]{1,2}\d{4}$/i;
    return newFormat.test(plate) || oldFormat.test(plate);
  }

  /**
   * Reconstitute an existing vehicle
   */
  static reconstitute(id: string, props: VehicleProps): Vehicle {
    return new Vehicle(new EntityId(id), props);
  }

  /**
   * Assign vehicle to a driver
   */
  assign(): void {
    if (this.props.status !== 'AVAILABLE') {
      throw new Error('Vehicle is not available');
    }
    this.props.status = 'IN_USE';
    this.touch();
  }

  /**
   * Release vehicle from assignment
   */
  release(): void {
    if (this.props.status !== 'IN_USE') {
      throw new Error('Vehicle is not in use');
    }
    this.props.status = 'AVAILABLE';
    this.touch();
  }

  /**
   * Send vehicle to maintenance
   */
  startMaintenance(reason: string): void {
    if (this.props.status === 'MAINTENANCE') {
      throw new Error('Vehicle is already in maintenance');
    }
    this.props.status = 'MAINTENANCE';
    this.touch();
  }

  /**
   * Complete maintenance
   */
  completeMaintenance(nextMaintenance?: Date): void {
    if (this.props.status !== 'MAINTENANCE') {
      throw new Error('Vehicle is not in maintenance');
    }
    this.props.status = 'AVAILABLE';
    this.props.lastMaintenance = new Date();
    if (nextMaintenance) {
      this.props.nextMaintenance = nextMaintenance;
    }
    this.touch();
  }

  /**
   * Take vehicle out of service
   */
  deactivate(reason: string): void {
    if (this.props.status === 'OUT_OF_SERVICE') {
      throw new Error('Vehicle is already out of service');
    }
    this.props.status = 'OUT_OF_SERVICE';
    this.props.notes = `Out of service: ${reason}`;
    this.touch();
  }

  /**
   * Reactivate vehicle
   */
  activate(): void {
    if (this.props.status !== 'OUT_OF_SERVICE') {
      throw new Error('Vehicle is not out of service');
    }
    this.props.status = 'AVAILABLE';
    this.touch();
  }

  /**
   * Update mileage
   */
  updateMileage(newMileage: number): void {
    if (newMileage < this.props.mileage) {
      throw new Error('New mileage cannot be less than current mileage');
    }
    this.props.mileage = newMileage;
    this.touch();
  }

  /**
   * Mark as updated
   */
  private touch(): void {
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  // Getters
  get plate(): string { return this.props.plate; }
  get brand(): string { return this.props.brand; }
  get model(): string { return this.props.model; }
  get type(): VehicleType { return this.props.type; }
  get capacity(): number { return this.props.capacity; }
  get year(): number { return this.props.year; }
  get status(): VehicleStatus { return this.props.status; }
  get mileage(): number { return this.props.mileage; }
  get lastMaintenance(): Date | undefined { return this.props.lastMaintenance; }
  get nextMaintenance(): Date | undefined { return this.props.nextMaintenance; }
  get insuranceExpiry(): Date { return this.props.insuranceExpiry; }
  get version(): number { return this.props.version; }

  /**
   * Check if insurance is about to expire (within 30 days)
   */
  isInsuranceExpiringSoon(): boolean {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.props.insuranceExpiry <= thirtyDaysFromNow;
  }

  /**
   * Check if maintenance is due
   */
  isMaintenanceDue(): boolean {
    if (!this.props.nextMaintenance) return false;
    return this.props.nextMaintenance <= new Date();
  }
}

// Add notes property for internal use
declare module './vehicle.entity' {
  interface VehicleProps {
    notes?: string;
  }
}