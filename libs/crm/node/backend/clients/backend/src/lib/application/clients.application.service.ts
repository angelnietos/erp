import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  ClientsRepositoryPort,
  CreateClientInput,
  UpdateClientInput,
} from '@generic-crm/clients-core';
import { CLIENTS_REPOSITORY } from '@generic-crm/clients-core';

@Injectable()
export class ClientsApplicationService {
  constructor(
    @Inject(CLIENTS_REPOSITORY)
    private readonly clients: ClientsRepositoryPort,
  ) {}

  list(tenantId: string) {
    return this.clients.listByTenant(tenantId);
  }

  async get(tenantId: string, id: string) {
    const row = await this.clients.findById(tenantId, id);
    if (!row) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return row;
  }

  create(tenantId: string, input: CreateClientInput) {
    return this.clients.create(tenantId, input);
  }

  async update(tenantId: string, id: string, input: UpdateClientInput) {
    await this.get(tenantId, id);
    return this.clients.update(tenantId, id, input);
  }

  async remove(tenantId: string, id: string) {
    await this.get(tenantId, id);
    return this.clients.softDelete(tenantId, id);
  }
}
