export class EntityId {
  readonly value: string;

  constructor(value?: string) {
    this.value = value ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : (require('crypto') as any).randomUUID());
  }

  equals(other: EntityId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
