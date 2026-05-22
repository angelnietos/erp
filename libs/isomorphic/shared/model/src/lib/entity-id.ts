export class EntityId {
  readonly value: string;

  constructor(value?: string) {
    this.value = value ?? generateUuid();
  }

  equals(other: EntityId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

function generateUuid(): string {
  const g: any = globalThis as any;
  if (g && g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID();
  }
  // RFC4122 v4 UUID fallback without Node 'crypto'
  // Generates xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
