import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

type ClientData = Record<string, unknown>;

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

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
        }
      },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return this.mapToDto(client);
  }

  async create(tenantId: string, data: any) {
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
        type: data.type || 'COMPANY'
      },
      include: {
        contacts: true
      }
    });
    return this.mapToDto(client);
  }

  async update(tenantId: string, id: string, data: any) {
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
    return this.mapToDto(client);
  }

  async delete(_tenantId: string, id: string) {
    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  private mapToDto(client: any) {
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
      // Compatibility fields
      company: client.name,
      status: client.deletedAt ? 'inactive' : 'active',
      createdAt: client.createdAt?.toISOString(),
      updatedAt: client.updatedAt?.toISOString(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`,
    };
  }
}
