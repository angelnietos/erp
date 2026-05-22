import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AuditLogWriterService,
  PrismaService,
} from '@josanz-erp/shared-infrastructure';

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
  contacts?: unknown;
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
  ) {}

  async findAll(tenantId: string) {
    const clients = await this.prisma.client.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        contacts: {
          where: { isPrimary: true },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return clients.map(c => this.mapToDto(c));
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
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        budgets: {
          include: {
            invoices: true,
            deliveryNotes: true
          },
          orderBy: { createdAt: 'desc' }
        },
        projects: {
          orderBy: { createdAt: 'desc' }
        },
        rentals: {
          include: {
            rentalItems: {
              include: {
                product: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return this.mapToDto(client);
  }

  async create(tenantId: string, data: ClientWriteBody, actorUserId: string) {
    const client = await this.prisma.client.create({
      data: {
        tenantId,
        name: data.name || data.company || 'Nuevo Cliente',
        taxId: data.taxId,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        country: data.country || 'ES',
        description: data.description,
        sector: data.sector || data.type || 'corporate',
        type: data.type || 'COMPANY',
      },
      include: {
        contacts: true
      }
    });
    await this.auditLogWriter.record(actorUserId, {
      action: 'CREATE',
      targetEntity: `Client:${client.id}`,
      changesJson: {
        entityType: 'CLIENT',
        entityName: client.name,
        details: 'Cliente creado',
      },
    });
    return this.mapToDto(client);
  }

  async update(tenantId: string, id: string, data: ClientWriteBody, actorUserId: string) {
    const client = await this.prisma.client.update({
      where: { id },
      data: {
        name: data.name || data.company,
        taxId: data.taxId,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        country: data.country,
        description: data.description,
        sector: data.sector || data.type,
        type: data.type
      },
      include: {
        contacts: true
      }
    });
    await this.auditLogWriter.record(actorUserId, {
      action: 'UPDATE',
      targetEntity: `Client:${client.id}`,
      changesJson: {
        entityType: 'CLIENT',
        entityName: client.name,
        details: 'Cliente actualizado',
      },
    });
    return this.mapToDto(client);
  }

  async delete(_tenantId: string, id: string, actorUserId: string) {
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
        changesJson: {
          entityType: 'CLIENT',
          entityName: row.name,
          details: 'Cliente eliminado (baja lógica)',
        },
      });
    }
    return { success: true };
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
      test_ping: 'pong',
      // Compatibility fields
      company: client.name,
      status: client.deletedAt ? 'inactive' : 'active',
      createdAt: client.createdAt?.toISOString(),
      updatedAt: client.updatedAt?.toISOString(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`,
    };
  }
}
