import { AggregateRoot, EntityId } from '@josanz-erp/shared-model';

export interface UserProps {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: string[];
  category?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class User extends AggregateRoot {
  readonly id: EntityId;
  private readonly props: UserProps;

  private constructor(id: EntityId, props: UserProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(props: Omit<UserProps, 'createdAt' | 'isActive'>): User {
    const id = new EntityId();
    return new User(id, {
      ...props,
      isActive: true,
      createdAt: new Date(),
    });
  }

  static reconstitute(id: string, props: UserProps): User {
    return new User(new EntityId(id), props);
  }

  updateProfile(
    firstName?: string,
    lastName?: string,
    category?: string,
  ): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.props.category = category;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  get email(): string {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get firstName(): string | undefined {
    return this.props.firstName;
  }
  get lastName(): string | undefined {
    return this.props.lastName;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get roles(): string[] {
    return this.props.roles;
  }
  get category(): string | undefined {
    return this.props.category;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
