import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@josanz-erp/shared-data-access';
import {
  FleetRepositoryPort,
  Vehicle,
  Driver,
  VehicleProps,
  DriverProps,
} from '../domain/ports/fleet.repository.port';
import { EntityId } from '@josanz-erp/shared-model';

/**
 * Prisma Fleet Repository Implementation
 * Implements FleetRepositoryPort for vehicle and driver persistence
 */
@Injectable()
export class PrismaFleetRepository implements FleetRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  // ===== Vehicle Operations =====

  async findVehicleById(id: EntityId): Promise<Vehicle | null> {
    const data = await this.prisma.vehicle.findUnique({
      where: { id: id.value },
    });
    return data ? this.mapVehicleToDomain(data) : null;
  }

  async findVehicleByPlate(plate: string): Promise<Vehicle | null> {
    const data = await this.prisma.vehicle.findUnique({
      where: { plate },
    });
    return data ? this.mapVehicleToDomain(data) : null;
  }

  async findAllVehicles(): Promise<Vehicle[]> {
    const data = await this.prisma.vehicle.findMany();
    return data.map((d) => this.mapVehicleToDomain(d));
  }

  async findVehiclesByStatus(status: string): Promise<Vehicle[]> {
    const data = await this.prisma.vehicle.findMany({
      where: { status },
    });
    return data.map((d) => this.mapVehicleToDomain(d));
  }

  async saveVehicle(vehicle: Vehicle): Promise<void> {
    const props = vehicle as unknown as VehiclePersistenceProps;
    await this.prisma.vehicle.upsert({
      where: { id: vehicle.id.value },
      update: {
        plate: props.plate,
        brand: props.brand,
        model: props.model,
        type: props.type,
        capacity: props.capacity,
        year: props.year,
        status: props.status,
        mileage: props.mileage,
        lastMaintenance: props.lastMaintenance,
        nextMaintenance: props.nextMaintenance,
        insuranceExpiry: props.insuranceExpiry,
        notes: props.notes,
        version: { increment: 1 },
      },
      create: {
        id: vehicle.id.value,
        plate: props.plate,
        brand: props.brand,
        model: props.model,
        type: props.type,
        capacity: props.capacity,
        year: props.year,
        status: props.status,
        mileage: props.mileage,
        lastMaintenance: props.lastMaintenance,
        nextMaintenance: props.nextMaintenance,
        insuranceExpiry: props.insuranceExpiry,
        notes: props.notes,
        version: props.version,
      },
    });
  }

  async deleteVehicle(id: EntityId): Promise<void> {
    await this.prisma.vehicle.delete({ where: { id: id.value } });
  }

  // ===== Driver Operations =====

  async findDriverById(id: EntityId): Promise<Driver | null> {
    const data = await this.prisma.driver.findUnique({
      where: { id: id.value },
    });
    return data ? this.mapDriverToDomain(data) : null;
  }

  async findDriverByEmployeeId(employeeId: string): Promise<Driver | null> {
    const data = await this.prisma.driver.findUnique({
      where: { employeeId },
    });
    return data ? this.mapDriverToDomain(data) : null;
  }

  async findDriverByNif(nif: string): Promise<Driver | null> {
    const data = await this.prisma.driver.findUnique({
      where: { nif },
    });
    return data ? this.mapDriverToDomain(data) : null;
  }

  async findAllDrivers(): Promise<Driver[]> {
    const data = await this.prisma.driver.findMany();
    return data.map((d) => this.mapDriverToDomain(d));
  }

  async findDriversByStatus(status: string): Promise<Driver[]> {
    const data = await this.prisma.driver.findMany({
      where: { status },
    });
    return data.map((d) => this.mapDriverToDomain(d));
  }

  async saveDriver(driver: Driver): Promise<void> {
    const props = driver as unknown as DriverPersistenceProps;
    await this.prisma.driver.upsert({
      where: { id: driver.id.value },
      update: {
        employeeId: props.employeeId,
        firstName: props.firstName,
        lastName: props.lastName,
        nif: props.nif,
        phone: props.phone,
        email: props.email,
        licenseType: props.licenseType,
        licenseNumber: props.licenseNumber,
        licenseExpiry: props.licenseExpiry,
        status: props.status,
        notes: props.notes,
        version: { increment: 1 },
      },
      create: {
        id: driver.id.value,
        employeeId: props.employeeId,
        firstName: props.firstName,
        lastName: props.lastName,
        nif: props.nif,
        phone: props.phone,
        email: props.email,
        licenseType: props.licenseType,
        licenseNumber: props.licenseNumber,
        licenseExpiry: props.licenseExpiry,
        status: props.status,
        hireDate: props.hireDate,
        notes: props.notes,
        version: props.version,
      },
    });
  }

  async deleteDriver(id: EntityId): Promise<void> {
    await this.prisma.driver.delete({ where: { id: id.value } });
  }

  // ===== Private Mappers =====

  private mapVehicleToDomain(data: PrismaVehicle): Vehicle {
    return Vehicle.reconstitute(data.id, {
      plate: data.plate,
      brand: data.brand,
      model: data.model,
      type: data.type as VehicleProps['type'],
      capacity: data.capacity,
      year: data.year,
      status: data.status as VehicleProps['status'],
      mileage: data.mileage,
      lastMaintenance: data.lastMaintenance,
      nextMaintenance: data.nextMaintenance,
      insuranceExpiry: data.insuranceExpiry,
      notes: data.notes,
      version: data.version,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private mapDriverToDomain(data: PrismaDriver): Driver {
    return Driver.reconstitute(data.id, {
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      nif: data.nif,
      phone: data.phone,
      email: data.email,
      licenseType: data.licenseType as DriverProps['licenseType'],
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      status: data.status as DriverProps['status'],
      hireDate: data.hireDate,
      notes: data.notes,
      version: data.version,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

// ===== Type Aliases for Prisma Models =====

type PrismaVehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  type: string;
  capacity: number;
  year: number;
  status: string;
  mileage: number;
  lastMaintenance: Date | null;
  nextMaintenance: Date | null;
  insuranceExpiry: Date;
  notes: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaDriver = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  nif: string;
  phone: string;
  email: string;
  licenseType: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: string;
  hireDate: Date;
  notes: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

// Extended props for persistence (includes internal properties)
interface VehiclePersistenceProps extends VehicleProps {
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DriverPersistenceProps extends DriverProps {
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}