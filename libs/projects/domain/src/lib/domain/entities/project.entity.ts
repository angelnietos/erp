import { AggregateRoot, EntityId } from '@josanz-erp/shared-model';

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ProjectProps {
  tenantId: EntityId;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  clientId?: EntityId;
  createdAt: Date;
}

export class Project extends AggregateRoot {
  readonly id: EntityId;
  private props: ProjectProps;

  private constructor(id: EntityId, props: ProjectProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(props: Omit<ProjectProps, 'createdAt' | 'status'>): Project {
    const id = new EntityId();
    return new Project(id, {
      ...props,
      status: 'ACTIVE',
      createdAt: new Date(),
    });
  }

  static reconstitute(id: string, props: ProjectProps): Project {
    return new Project(new EntityId(id), props);
  }

  updateBasicInfo(name: string, description?: string): void {
    this.props.name = name;
    this.props.description = description;
  }

  updateDates(startDate?: Date, endDate?: Date): void {
    if (endDate && startDate && endDate < startDate) {
      throw new Error(
        'Project endDate must be greater than or equal to startDate',
      );
    }
    this.props.startDate = startDate;
    this.props.endDate = endDate;
  }

  assignClient(clientId: EntityId): void {
    this.props.clientId = clientId;
  }

  complete(): void {
    if (this.props.status !== 'ACTIVE') {
      throw new Error(
        `Cannot complete a project in status: ${this.props.status}`,
      );
    }
    this.props.status = 'COMPLETED';
  }

  cancel(): void {
    if (this.props.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed project');
    }
    this.props.status = 'CANCELLED';
  }

  reactivate(): void {
    if (this.props.status !== 'CANCELLED') {
      throw new Error(
        `Cannot reactivate a project in status: ${this.props.status}`,
      );
    }
    this.props.status = 'ACTIVE';
  }

  duplicate(): Project {
    const duplicatedProps: Omit<ProjectProps, 'createdAt' | 'status'> = {
      tenantId: this.props.tenantId,
      name: `${this.props.name} (Copy)`,
      description: this.props.description,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      clientId: this.props.clientId,
    };
    return Project.create(duplicatedProps);
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

  get status(): ProjectStatus {
    return this.props.status;
  }

  get startDate(): Date | undefined {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get clientId(): EntityId | undefined {
    return this.props.clientId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
