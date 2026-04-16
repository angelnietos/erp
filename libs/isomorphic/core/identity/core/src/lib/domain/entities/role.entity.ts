import { Entity, EntityId } from '@josanz-erp/shared-model';
import { RoleType } from './role-type.enum';

export interface RoleProps {
  tenantId?: string;
  name: string;
  description?: string;
  type: RoleType;
  permissions: string[];
}

export class Role extends Entity {
  readonly id: EntityId;
  private readonly props: RoleProps;

  private constructor(id: EntityId, props: RoleProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(props: RoleProps): Role {
    const id = new EntityId();
    return new Role(id, props);
  }

  static reconstitute(id: string, props: RoleProps): Role {
    return new Role(new EntityId(id), props);
  }

  get tenantId(): string | undefined {
    return this.props.tenantId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get type(): RoleType {
    return this.props.type;
  }

  get permissions(): string[] {
    return [...this.props.permissions];
  }

  updatePermissions(permissions: string[]): void {
    this.props.permissions = [...permissions];
  }

  updateName(name: string): void {
    this.props.name = name;
  }
}
