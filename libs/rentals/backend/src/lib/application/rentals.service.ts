import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

type RentalData = Record<string, unknown>;

@Injectable()
export class RentalsService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get db(): any { return this.prisma; }

  async findAll(
    tenantId: string,
    opts?: { status?: string; search?: string },
  ) {
    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (opts?.status) {
      where['status'] = opts.status;
    }
    if (opts?.search?.trim()) {
      const q = opts.search.trim();
      where['OR'] = [
        { reference: { contains: q, mode: 'insensitive' } },
        { client: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }
    const rentals = await this.db.rental.findMany({
      where,
      include: { client: true, rentalItems: true },
      orderBy: { createdAt: 'desc' },
    });
    return rentals.map((r: Record<string, unknown>) => this.mapToDto(r));
  }

  async findOne(tenantId: string, id: string) {
    const rental = await this.db.rental.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { client: true, rentalItems: true },
    });
    if (!rental) throw new NotFoundException('Alquiler no encontrado');
    return this.mapToDto(rental);
  }

  async create(tenantId: string, data: RentalData) {
    const rental = await this.db.rental.create({
      data: {
        tenantId,
        clientId: String(data['clientId'] || ''),
        reference: data['reference'] ? String(data['reference']) : `RNT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        status: String(data['status'] || 'DRAFT'),
        startDate: data['startDate'] ? new Date(String(data['startDate'])) : new Date(),
        endDate: data['endDate'] ? new Date(String(data['endDate'])) : new Date(new Date().setDate(new Date().getDate() + 1)),
        pickupLocation: String(data['pickupLocation'] || 'Almacén Central'),
        dropoffLocation: String(data['dropoffLocation'] || 'Almacén Central'),
        totalPrice: Number(
          data['totalPrice'] ?? data['totalAmount'] ?? 0,
        ),
        notes: String(data['notes'] || ''),
      },
      include: { client: true, rentalItems: true }
    });
    return this.mapToDto(rental);
  }

  async update(_tenantId: string, id: string, data: Partial<RentalData>) {
    const updateData: Record<string, unknown> = {};
    if (data['status']) updateData['status'] = String(data['status']);
    if (data['notes']) updateData['notes'] = String(data['notes']);
    if (data['startDate']) updateData['startDate'] = new Date(String(data['startDate']));
    if (data['endDate']) updateData['endDate'] = new Date(String(data['endDate']));
    if (data['totalPrice'] != null)
      updateData['totalPrice'] = Number(data['totalPrice']);
    if (data['totalAmount'] != null)
      updateData['totalPrice'] = Number(data['totalAmount']);

    const rental = await this.db.rental.update({
      where: { id },
      data: updateData,
      include: { client: true, rentalItems: true }
    });
    return this.mapToDto(rental);
  }

  async delete(_tenantId: string, id: string) {
    await this.db.rental.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  private mapToDto(rental: Record<string, unknown>) {
    const client = rental['client'] as Record<string, unknown> | null;
    const rentalItems = rental['rentalItems'] as Record<string, unknown>[] | null;
    const items = rentalItems ?? [];
    const totalPrice = Number(rental['totalPrice'] ?? 0);
    const createdAt = rental['createdAt'] as Date | undefined;
    return {
      id: rental['id'],
      reference: rental['reference'],
      clientId: rental['clientId'],
      clientName: client?.['name'] || 'Cliente Desconocido',
      startDate: rental['startDate']
        ? (rental['startDate'] as Date).toISOString().split('T')[0]
        : '',
      endDate: rental['endDate']
        ? (rental['endDate'] as Date).toISOString().split('T')[0]
        : '',
      status: rental['status'],
      totalPrice,
      totalAmount: totalPrice,
      itemsCount: items.length,
      createdAt: createdAt
        ? createdAt.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      pickupLocation: rental['pickupLocation'],
      dropoffLocation: rental['dropoffLocation'],
      notes: rental['notes'],
      items: items.map((i: Record<string, unknown>) => ({
        id: i['id'],
        productId: i['productId'],
        productName: 'Producto',
        quantity: i['quantity'],
        unitPrice: i['unitPrice'] ?? 0,
        total: Number(i['quantity']) * Number(i['unitPrice'] ?? 0),
      })),
    };
  }
}
