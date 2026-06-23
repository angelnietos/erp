import { Injectable } from '@nestjs/common';
import type { Prisma } from '@generic-crm/prisma-client';
import { PrismaService } from '@generic-crm/shared-infrastructure';
import type {
  ClientRecord,
  ClientsRepositoryPort,
  CreateClientInput,
  UpdateClientInput,
} from '@generic-crm/clients-core';

const includeContacts = { contacts: true } as const;

type ClientWithContacts = Prisma.ClientGetPayload<{
  include: typeof includeContacts;
}>;

@Injectable()
export class PrismaClientsRepository implements ClientsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private map(c: ClientWithContacts): ClientRecord {
    return {
      id: c.id,
      tenantId: c.tenantId,
      name: c.name,
      description: c.description,
      sector: c.sector,
      type: c.type,
      taxId: c.taxId,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      zipCode: c.zipCode,
      country: c.country,
      createdAt: c.createdAt,
      deletedAt: c.deletedAt,
      contacts: c.contacts.map((ct) => ({
        id: ct.id,
        name: ct.name,
        email: ct.email,
        phone: ct.phone,
        position: ct.position,
        notes: ct.notes,
        isPrimary: ct.isPrimary,
      })),
    };
  }

  async listByTenant(tenantId: string): Promise<ClientRecord[]> {
    const rows = await this.prisma.client.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: 'asc' },
      include: includeContacts,
    });
    return rows.map((r) => this.map(r));
  }

  async findById(tenantId: string, id: string): Promise<ClientRecord | null> {
    const row = await this.prisma.client.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: includeContacts,
    });
    return row ? this.map(row) : null;
  }

  async create(
    tenantId: string,
    input: CreateClientInput,
  ): Promise<ClientRecord> {
    const row = await this.prisma.client.create({
      data: {
        tenantId,
        name: input.name,
        description: input.description,
        sector: input.sector,
        type: input.type ?? 'COMPANY',
        taxId: input.taxId,
        email: input.email,
        phone: input.phone,
        address: input.address,
        city: input.city,
        zipCode: input.zipCode,
        country: input.country ?? 'ES',
      },
      include: includeContacts,
    });
    return this.map(row);
  }

  async update(
    _tenantId: string,
    id: string,
    input: UpdateClientInput,
  ): Promise<ClientRecord> {
    const row = await this.prisma.client.update({
      where: { id },
      data: { ...input },
      include: includeContacts,
    });
    return this.map(row);
  }

  async softDelete(_tenantId: string, id: string): Promise<ClientRecord> {
    const row = await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: includeContacts,
    });
    return this.map(row);
  }
}
