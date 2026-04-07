import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

type VehicleData = Record<string, unknown>;

@Injectable()
export class FleetService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get db(): any { return this.prisma; }

  async findAll(tenantId: string) {
    const vehicles = await this.db.vehicle.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return vehicles.map((v: Record<string, unknown>) => this.mapToDto(v));
  }

  async findOne(tenantId: string, id: string) {
    const vehicle = await this.db.vehicle.findFirst({ where: { id, tenantId } });
    if (!vehicle) throw new NotFoundException('Vehículo no encontrado');
    return this.mapToDto(vehicle);
  }

  async create(tenantId: string, data: VehicleData) {
    const vehicle = await this.db.vehicle.create({
      data: {
        tenantId,
        name: String(data['name'] || 'Vehículo ' + String(data['plate'])),
        plate: String(data['plate'] || ''),
        type: String(data['type'] || 'van'),
        capacity: Number(data['capacity'] || 1000),
        status: String(data['status'] || 'available'),
        location: String(data['location'] || 'Sede Principal'),
        nextMaintenance: data['nextMaintenance']
          ? new Date(String(data['nextMaintenance']))
          : new Date(new Date().setMonth(new Date().getMonth() + 6)),
      },
    });
    return this.mapToDto(vehicle);
  }

  async update(_tenantId: string, id: string, data: Partial<VehicleData>) {
    const updateData: Record<string, unknown> = {};
    if (data['status']) updateData['status'] = String(data['status']);
    if (data['location']) updateData['location'] = String(data['location']);
    if (data['nextMaintenance']) updateData['nextMaintenance'] = new Date(String(data['nextMaintenance']));
    if (data['name']) updateData['name'] = String(data['name']);
    if (data['type']) updateData['type'] = String(data['type']);
    if (data['capacity']) updateData['capacity'] = Number(data['capacity']);

    const vehicle = await this.db.vehicle.update({ where: { id }, data: updateData });
    return this.mapToDto(vehicle);
  }

  async delete(_tenantId: string, id: string) {
    await this.db.vehicle.delete({ where: { id } });
    return { success: true };
  }

  private mapToDto(vehicle: Record<string, unknown>) {
    const name = String(vehicle['name'] || '');
    return {
      id: vehicle['id'],
      name,
      plate: vehicle['plate'],
      brand: name.split(' ')[0] || 'Desconocida',
      model: name.split(' ').slice(1).join(' ') || 'Modelo',
      year: 2024,
      type: vehicle['type'],
      capacity: vehicle['capacity'],
      status: vehicle['status'],
      location: vehicle['location'],
      currentDriver: null,
      insuranceExpiry: '2027-01-01',
      itvExpiry: vehicle['nextMaintenance']
        ? (vehicle['nextMaintenance'] as Date).toISOString().split('T')[0]
        : '2027-01-01',
      mileage: 10000,
      createdAt: vehicle['createdAt']
        ? (vehicle['createdAt'] as Date).toISOString().split('T')[0]
        : '2026-01-01',
    };
  }
}
