import { User } from '@josanz-erp/identity-core';

export interface UserRepositoryPort {
  /** When tenantId is omitted, uses request CLS (x-tenant-id). */
  findByEmail(email: string, tenantId?: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
