import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

type ClientData = { name: string; email?: string; phone?: string; company?: string; address?: string; status?: string; type?: string; [key: string]: unknown };

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const clients = await this.prisma.client.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return clients.map(c => this.mapToDto(c));
  }

  async findOne(tenantId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return this.mapToDto(client);
  }

  async create(tenantId: string, data: ClientData) {
    const client = await this.prisma.client.create({
      data: {
        tenantId,
        name: data.name || data.company || 'Nuevo Cliente',
        description: data.address || data.email || null,
        sector: data.type || 'corporate'
      },
    });
    return this.mapToDto(client);
  }

  async update(tenantId: string, id: string, data: ClientData) {
    const client = await this.prisma.client.update({
      where: { id },
      data: {
        name: data.name || data.company,
        description: data.address || data.email,
        sector: data.type
      },
    });
    return this.mapToDto(client);
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  private mapToDto(client: Record<string, unknown>) {
    return {
      id: client.id,
      name: client.name,
      email: client.description || 'info@cliente.com',
      phone: '+34 600 000 000',
      company: client.name,
      address: client.description || 'Dirección no especificada',
      status: 'active',
      type: client.sector || 'corporate',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`
    };
  }
}
