import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AuditLogWriterService,
  PiiCryptoService,
  PrismaService,
} from '@josanz-erp/shared-infrastructure';
import { CLIENT_CONTACT_PII_FIELDS } from '@josanz-erp/shared-infrastructure';

/** HTTP body for create/update — fields are optional and coerced in handlers */
interface ClientWriteBody {
  name?: string;
  company?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  description?: string;
  sector?: string;
  type?: string;
}

/** Prisma row shape used by mapToDto (includes optional relations) */
interface ClientEntityPayload {
  id: string;
  name: string;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  zipCode?: string | null;
  country?: string | null;
  description?: string | null;
  sector?: string | null;
  type?: string | null;
  contacts?: Array<{
    id?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    isPrimary?: boolean;
    [key: string]: unknown;
  }>;
  eventReports?: unknown;
  budgets?: unknown;
  projects?: unknown;
  rentals?: unknown;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogWriter: AuditLogWriterService,
    private readonly piiCrypto: PiiCryptoService,
  ) {}

  async findAll(tenantId: string) {
    const clients = await this.prisma.client.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        contacts: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return clients.map((c) => this.mapToDto(this.decryptClientRow(c)));
  }

  async findOne(tenantId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        contacts: true,
        eventReports: {
          include: {
            event: true,
            author: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        budgets: {
          include: {
            invoices: true,
            deliveryNotes: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        projects: {
          orderBy: { createdAt: 'desc' },
        },
        rentals: {
          include: {
            rentalItems: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return this.mapToDto(this.decryptClientRow(client));
  }

  async create(tenantId: string, data: ClientWriteBody, actorUserId: string) {
    const encrypted = this.encryptClientWrite(data);
    const client = await this.prisma.client.create({
      data: {
        tenantId,
        name: data.name || data.company || 'Nuevo Cliente',
        taxId: encrypted.taxId,
        email: encrypted.email,
        phone: encrypted.phone,
        address: encrypted.address,
        city: data.city,
        zipCode: data.zipCode,
        country: data.country || 'ES',
        description: data.description,
        sector: data.sector || data.type || 'corporate',
        type: data.type || 'COMPANY',
      },
      include: {
        contacts: true,
      },
    });
    await this.auditLogWriter.record(actorUserId, {
      action: 'CREATE',
      targetEntity: `Client:${client.id}`,
      tenantId,
      changesJson: {
        entityType: 'CLIENT',
        entityName: client.name,
        details: 'Cliente creado (PII cifrado en reposo)',
      },
    });
    return this.mapToDto(this.decryptClientRow(client));
  }

  async update(
    tenantId: string,
    id: string,
    data: ClientWriteBody,
    actorUserId: string,
  ) {
    const encrypted = this.encryptClientWrite(data);
    const client = await this.prisma.client.update({
      where: { id },
      data: {
        name: data.name || data.company,
        taxId: encrypted.taxId,
        email: encrypted.email,
        phone: encrypted.phone,
        address: encrypted.address,
        city: data.city,
        zipCode: data.zipCode,
        country: data.country,
        description: data.description,
        sector: data.sector || data.type,
        type: data.type,
      },
      include: {
        contacts: true,
      },
    });
    await this.auditLogWriter.record(actorUserId, {
      action: 'UPDATE',
      targetEntity: `Client:${client.id}`,
      tenantId,
      changesJson: {
        entityType: 'CLIENT',
        entityName: client.name,
        details: 'Cliente actualizado',
      },
    });
    return this.mapToDto(this.decryptClientRow(client));
  }

  async delete(tenantId: string, id: string, actorUserId: string) {
    const row = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
      select: { name: true },
    });
    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    if (row) {
      await this.auditLogWriter.record(actorUserId, {
        action: 'DELETE',
        targetEntity: `Client:${id}`,
        tenantId,
        changesJson: {
          entityType: 'CLIENT',
          entityName: row.name,
          details: 'Cliente eliminado (baja lógica)',
        },
      });
    }
    return { success: true };
  }

  private encryptClientWrite(data: ClientWriteBody): {
    taxId?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } {
    return {
      taxId: this.piiCrypto.encryptField(data.taxId),
      email: this.piiCrypto.encryptField(data.email),
      phone: this.piiCrypto.encryptField(data.phone),
      address: this.piiCrypto.encryptField(data.address),
    };
  }

  private decryptClientRow<T extends ClientEntityPayload>(row: T): T {
    const decrypted: ClientEntityPayload = {
      ...row,
      taxId: this.piiCrypto.decryptField(row.taxId),
      email: this.piiCrypto.decryptField(row.email),
      phone: this.piiCrypto.decryptField(row.phone),
      address: this.piiCrypto.decryptField(row.address),
      contacts: (row.contacts ?? []).map((c) => this.decryptContact(c)),
    };
    return decrypted as T;
  }

  private decryptContact(
    contact: NonNullable<ClientEntityPayload['contacts']>[number],
  ) {
    const out = { ...contact };
    for (const field of CLIENT_CONTACT_PII_FIELDS) {
      const v = out[field];
      if (typeof v === 'string') {
        (out as Record<string, unknown>)[field] =
          this.piiCrypto.decryptField(v);
      }
    }
    return out;
  }

  private mapToDto(client: ClientEntityPayload) {
    return {
      id: client.id,
      name: client.name,
      taxId: client.taxId,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      zipCode: client.zipCode,
      country: client.country,
      description: client.description,
      sector: client.sector,
      type: client.type,
      contacts: client.contacts || [],
      eventReports: client.eventReports || [],
      budgets: client.budgets || [],
      projects: client.projects || [],
      rentals: client.rentals || [],
      company: client.name,
      status: client.deletedAt ? 'inactive' : 'active',
      createdAt: client.createdAt?.toISOString(),
      updatedAt: client.updatedAt?.toISOString(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`,
      piiEncryptedAtRest: true,
    };
  }
}
