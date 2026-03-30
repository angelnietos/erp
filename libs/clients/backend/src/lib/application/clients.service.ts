import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

type ClientData = Record<string, unknown>;

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const clients = await this.prisma.client.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return clients.map(c => this.mapToDto(c as Record<string, unknown>));
  }

  async findOne(tenantId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return this.mapToDto(client as Record<string, unknown>);
  }

  async create(tenantId: string, data: ClientData) {
    const client = await this.prisma.client.create({
      data: {
        tenantId,
        name: String(data['name'] || data['company'] || 'Nuevo Cliente'),
        description: data['address'] ? String(data['address']) : data['email'] ? String(data['email']) : undefined,
        sector: data['type'] ? String(data['type']) : 'corporate'
      },
    });
    return this.mapToDto(client as Record<string, unknown>);
  }

  async update(tenantId: string, id: string, data: ClientData) {
    const updateData: Record<string, unknown> = {};
    if (data['name'] || data['company']) updateData['name'] = String(data['name'] || data['company']);
    if (data['address'] || data['email']) updateData['description'] = String(data['address'] || data['email']);
    if (data['type']) updateData['sector'] = String(data['type']);

    const client = await this.prisma.client.update({
      where: { id },
      data: updateData as Parameters<typeof this.prisma.client.update>[0]['data'],
    });
    return this.mapToDto(client as Record<string, unknown>);
  }

  async delete(_tenantId: string, id: string) {
    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  private mapToDto(client: Record<string, unknown>) {
    const createdAt = client['createdAt'] as Date | undefined;
    const desc = String(client['description'] ?? '');
    return {
      id: client['id'],
      name: client['name'],
      description: desc,
      sector: String(client['sector'] ?? 'corporate'),
      contact: 'Comercial',
      email: 'info@cliente.com',
      phone: '+34 600 000 000',
      company: client['name'],
      address: desc || 'Dirección no especificada',
      status: 'active',
      type: client['sector'] || 'corporate',
      createdAt: createdAt?.toISOString(),
      updatedAt: undefined,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(String(client['name'] || ''))}&background=random`,
    };
  }
}
