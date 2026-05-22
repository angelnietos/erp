import { AggregateRoot, EntityId } from '@josanz-erp/shared-model';
import { ServiceType } from '@josanz-erp/services-api';

export interface ServiceProps {
  tenantId: EntityId;
  name: string;
  description?: string;
  type: ServiceType;
  basePrice: number;
  hourlyRate?: number;
  configuration?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export class Service extends AggregateRoot {
  readonly id: EntityId;
  private props: ServiceProps;

  private constructor(id: EntityId, props: ServiceProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(props: Omit<ServiceProps, 'createdAt' | 'isActive'>): Service {
    const id = new EntityId();
    return new Service(id, {
      ...props,
      isActive: true,
      createdAt: new Date(),
    });
  }

  static reconstitute(id: string, props: ServiceProps): Service {
    return new Service(new EntityId(id), props);
  }

  updateBasicInfo(name: string, description?: string): void {
    this.props.name = name;
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  updatePricing(basePrice: number, hourlyRate?: number): void {
    if (basePrice < 0) {
      throw new Error('Base price cannot be negative');
    }
    if (hourlyRate !== undefined && hourlyRate < 0) {
      throw new Error('Hourly rate cannot be negative');
    }
    this.props.basePrice = basePrice;
    this.props.hourlyRate = hourlyRate;
    this.props.updatedAt = new Date();
  }

  updateConfiguration(configuration: Record<string, unknown>): void {
    this.props.configuration = configuration;
    this.props.updatedAt = new Date();
  }

  changeType(type: ServiceType): void {
    this.props.type = type;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  get tenantId(): EntityId {
    return this.props.tenantId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get type(): ServiceType {
    return this.props.type;
  }

  get basePrice(): number {
    return this.props.basePrice;
  }

  get hourlyRate(): number | undefined {
    return this.props.hourlyRate;
  }

  get configuration(): Record<string, unknown> | undefined {
    return this.props.configuration;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
