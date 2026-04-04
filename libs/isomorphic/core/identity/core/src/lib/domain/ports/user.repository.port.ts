import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
  /** When tenantId is omitted, uses request CLS (x-tenant-id). */
  findByEmail(email: string, tenantId?: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(tenantId?: string): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
