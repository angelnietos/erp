import { AggregateRoot, EntityId } from '@josanz-erp/shared-model';

export interface UserProps {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: string[];
  /** Permisos granulares además de los que aportan los roles (p. ej. acceso puntual). */
  extraPermissions: string[];
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

  static create(
    props: Omit<UserProps, 'createdAt' | 'isActive' | 'extraPermissions'> & {
      extraPermissions?: string[];
    },
  ): User {
    const id = new EntityId();
    return new User(id, {
      ...props,
      extraPermissions: props.extraPermissions ?? [],
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
    if (firstName !== undefined) {
      this.props.firstName = firstName;
    }
    if (lastName !== undefined) {
      this.props.lastName = lastName;
    }
    if (category !== undefined) {
      this.props.category = category;
    }
    if (firstName !== undefined || lastName !== undefined || category !== undefined) {
      this.props.updatedAt = new Date();
    }
  }

  updateEmail(email: string): void {
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  setIsActive(isActive: boolean): void {
    this.props.isActive = isActive;
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
  get extraPermissions(): string[] {
    return this.props.extraPermissions;
  }
  setRoles(roles: string[]): void {
    this.props.roles = [...roles];
    this.props.updatedAt = new Date();
  }
  setExtraPermissions(extraPermissions: string[]): void {
    this.props.extraPermissions = [...extraPermissions];
    this.props.updatedAt = new Date();
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
