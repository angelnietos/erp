import { AggregateRoot, EntityId } from '@josanz-erp/shared-model';

/**
 * Driver Status
 */
export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'SUSPENDED';

/**
 * Driver License Type
 */
export type LicenseType = 'B' | 'C' | 'D' | 'E';

/**
 * Driver Props
 */
export interface DriverProps {
  employeeId: string;
  firstName: string;
  lastName: string;
  nif: string;
  phone: string;
  email: string;
  licenseType: LicenseType;
  licenseNumber: string;
  licenseExpiry: Date;
  status: DriverStatus;
  hireDate: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Driver Entity
 * Represents a driver in the ERP fleet management
 */
export class Driver extends AggregateRoot {
  readonly id: EntityId;
  private readonly props: DriverProps;

  private constructor(id: EntityId, props: DriverProps) {
    super();
    this.id = id;
    this.props = props;
  }

  /**
   * Create a new driver
   */
  static create(params: {
    employeeId: string;
    firstName: string;
    lastName: string;
    nif: string;
    phone: string;
    email: string;
    licenseType: LicenseType;
    licenseNumber: string;
    licenseExpiry: Date;
    hireDate: Date;
  }): Driver {
    const id = new EntityId();
    const now = new Date();
    return new Driver(id, {
      employeeId: params.employeeId,
      firstName: params.firstName,
      lastName: params.lastName,
      nif: params.nif,
      phone: params.phone,
      email: params.email,
      licenseType: params.licenseType,
      licenseNumber: params.licenseNumber,
      licenseExpiry: params.licenseExpiry,
      status: 'ACTIVE',
      hireDate: params.hireDate,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstitute an existing driver
   */
  static reconstitute(id: string, props: DriverProps): Driver {
    return new Driver(new EntityId(id), props);
  }

  /**
   * Activate driver
   */
  activate(): void {
    if (this.props.status === 'ACTIVE') {
      throw new Error('Driver is already active');
    }
    this.props.status = 'ACTIVE';
    this.touch();
  }

  /**
   * Deactivate driver
   */
  deactivate(): void {
    if (this.props.status === 'INACTIVE') {
      throw new Error('Driver is already inactive');
    }
    this.props.status = 'INACTIVE';
    this.touch();
  }

  /**
   * Put driver on leave
   */
  startLeave(_startDate: Date, _endDate: Date): void {
    if (this.props.status === 'ON_LEAVE') {
      throw new Error('Driver is already on leave');
    }
    this.props.status = 'ON_LEAVE';
    this.touch();
  }

  /**
   * End leave
   */
  endLeave(): void {
    if (this.props.status !== 'ON_LEAVE') {
      throw new Error('Driver is not on leave');
    }
    this.props.status = 'ACTIVE';
    this.touch();
  }

  /**
   * Suspend driver
   */
  suspend(_reason: string): void {
    if (this.props.status === 'SUSPENDED') {
      throw new Error('Driver is already suspended');
    }
    this.props.status = 'SUSPENDED';
    this.props.notes = `Suspended: ${reason}`;
    this.touch();
  }

  /**
   * Unsuspend driver
   */
  unsuspend(): void {
    if (this.props.status !== 'SUSPENDED') {
      throw new Error('Driver is not suspended');
    }
    this.props.status = 'ACTIVE';
    this.touch();
  }

  /**
   * Update license
   */
  updateLicense(licenseNumber: string, licenseExpiry: Date, licenseType: LicenseType): void {
    this.props.licenseNumber = licenseNumber;
    this.props.licenseExpiry = licenseExpiry;
    this.props.licenseType = licenseType;
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
  get employeeId(): string { return this.props.employeeId; }
  get firstName(): string { return this.props.firstName; }
  get lastName(): string { return this.props.lastName; }
  get fullName(): string { return `${this.props.firstName} ${this.props.lastName}`; }
  get nif(): string { return this.props.nif; }
  get phone(): string { return this.props.phone; }
  get email(): string { return this.props.email; }
  get licenseType(): LicenseType { return this.props.licenseType; }
  get licenseNumber(): string { return this.props.licenseNumber; }
  get licenseExpiry(): Date { return this.props.licenseExpiry; }
  get status(): DriverStatus { return this.props.status; }
  get hireDate(): Date { return this.props.hireDate; }
  get version(): number { return this.props.version; }

  /**
   * Check if license is about to expire (within 30 days)
   */
  isLicenseExpiringSoon(): boolean {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.props.licenseExpiry <= thirtyDaysFromNow;
  }

  /**
   * Check if license is expired
   */
  isLicenseExpired(): boolean {
    return this.props.licenseExpiry <= new Date();
  }
}

// Add notes property for internal use
declare module './driver.entity' {
  interface DriverProps {
    notes?: string;
  }
}
