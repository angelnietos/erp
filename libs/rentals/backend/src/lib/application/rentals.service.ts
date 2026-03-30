import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

type RentalData = { reference?: string; clientId: string; status?: string; startDate?: string; endDate?: string; pickupLocation?: string; dropoffLocation?: string; totalPrice?: number; notes?: string; [key: string]: unknown };

@Injectable()
export class RentalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const rentals = await this.prisma.rental.findMany({
      where: { tenantId, deletedAt: null },
      include: { client: true, rentalItems: true },
      orderBy: { createdAt: 'desc' },
    });
    return rentals.map(r => this.mapToDto(r));
  }

  async findOne(tenantId: string, id: string) {
    const rental = await this.prisma.rental.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { client: true, rentalItems: true },
    });
    if (!rental) throw new NotFoundException('Alquiler no encontrado');
    return this.mapToDto(rental);
  }

  async create(tenantId: string, data: RentalData) {
    const rental = await this.prisma.rental.create({
      data: {
        tenantId,
        clientId: data.clientId,
        reference: data.reference || `RNT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        status: data.status || 'pending',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(new Date().setDate(new Date().getDate() + 1)),
        pickupLocation: data.pickupLocation || 'Almacén Central',
        dropoffLocation: data.dropoffLocation || 'Almacén Central',
        totalPrice: data.totalPrice || 0,
        notes: data.notes || '',
      },
      include: { client: true, rentalItems: true }
    });
    return this.mapToDto(rental);
  }

  async update(tenantId: string, id: string, data: Partial<RentalData>) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.notes) updateData.notes = data.notes;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const rental = await this.prisma.rental.update({
      where: { id },
      data: updateData,
      include: { client: true, rentalItems: true }
    });
    return this.mapToDto(rental);
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.rental.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  private mapToDto(rental: any) {
    return {
      id: rental.id,
      reference: rental.reference,
      clientId: rental.clientId,
      clientName: rental.client?.name || 'Cliente Desconocido',
      startDate: rental.startDate ? rental.startDate.toISOString().split('T')[0] : null,
      endDate: rental.endDate ? rental.endDate.toISOString().split('T')[0] : null,
      status: rental.status,
      totalPrice: rental.totalPrice || 0,
      pickupLocation: rental.pickupLocation,
      dropoffLocation: rental.dropoffLocation,
      notes: rental.notes,
      items: rental.rentalItems?.map((i: any) => ({
        id: i.id,
        productId: i.productId,
        productName: 'Producto', // Mock para front, se haría JOIN profundo en la real
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.quantity * i.unitPrice
      })) || []
    };
  }
}
