import type {
  ClientRecord,
  CreateClientInput,
  UpdateClientInput,
} from './client.types';

export const CLIENTS_REPOSITORY = Symbol('CLIENTS_REPOSITORY');

export interface ClientsRepositoryPort {
  listByTenant(tenantId: string): Promise<ClientRecord[]>;
  findById(tenantId: string, id: string): Promise<ClientRecord | null>;
  create(tenantId: string, input: CreateClientInput): Promise<ClientRecord>;
  update(
    tenantId: string,
    id: string,
    input: UpdateClientInput,
  ): Promise<ClientRecord>;
  softDelete(tenantId: string, id: string): Promise<ClientRecord>;
}
