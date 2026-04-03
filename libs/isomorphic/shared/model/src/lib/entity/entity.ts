import { EntityId } from '../entity-id';

/**
 * Base Entity class with ID and equality comparison.
 * All domain entities should extend this class.
 */
export abstract class Entity<T> {
  protected readonly _id: EntityId;
  protected readonly props: T;

  constructor(props: T, id?: EntityId) {
    this._id = id ?? new EntityId();
    this.props = props;
  }

  get id(): EntityId {
    return this._id;
  }

  equals(other?: Entity<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._id.equals(other._id);
  }
}
