import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

type VehicleData = { name: string; plate: string; type: string; capacity: number; status?: string; location?: string; nextMaintenance?: string; [key: string]: unknown };

@Injectable()
export class FleetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return vehicles.map(v => this.mapToDto(v));
  }

  async findOne(tenantId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
    });
    if (!vehicle) throw new NotFoundException('Vehículo no encontrado');
    return this.mapToDto(vehicle);
  }

  async create(tenantId: string, data: VehicleData) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        tenantId,
        name: data.name || 'Vehículo ' + data.plate,
        plate: data.plate,
        type: data.type || 'van',
        capacity: data.capacity || 1000,
        status: data.status || 'available',
        location: data.location || 'Sede Principal',
        nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : new Date(new Date().setMonth(new Date().getMonth() + 6)),
      },
    });
    return this.mapToDto(vehicle);
  }

  async update(tenantId: string, id: string, data: Partial<VehicleData>) {
    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.location) updateData.location = data.location;
    if (data.nextMaintenance) updateData.nextMaintenance = new Date(data.nextMaintenance);
    if (data.name) updateData.name = data.name;
    if (data.type) updateData.type = data.type;
    if (data.capacity) updateData.capacity = data.capacity;

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
    return this.mapToDto(vehicle);
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.vehicle.delete({
      where: { id },
    });
    return { success: true };
  }

  private mapToDto(vehicle: Record<string, unknown>) {
    return {
      id: vehicle['id'],
      name: vehicle['name'],
      plate: vehicle['plate'],
      brand: (vehicle['name'] as string)?.split(' ')[0] || 'Desconocida',
      model: (vehicle['name'] as string)?.split(' ').slice(1).join(' ') || 'Modelo',
      year: 2024,
      type: vehicle['type'],
      capacity: vehicle['capacity'],
      status: vehicle['status'],
      location: vehicle['location'],
      currentDriver: null,
      insuranceExpiry: '2027-01-01',
      itvExpiry: vehicle['nextMaintenance'] ? (vehicle['nextMaintenance'] as Date).toISOString().split('T')[0] : '2027-01-01',
      mileage: 10000,
      createdAt: vehicle['createdAt'] ? (vehicle['createdAt'] as Date).toISOString().split('T')[0] : '2026-01-01',
    };
  }
}
