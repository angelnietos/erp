import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import type {
  SetAvailabilityBodyDto,
  BulkAvailabilityBodyDto,
  UpdateTechnicianBodyDto,
} from './technicians.dto';

export type SetAvailabilityDto = SetAvailabilityBodyDto;
export type BulkAvailabilityDto = BulkAvailabilityBodyDto;
export type UpdateTechnicianDto = UpdateTechnicianBodyDto;

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ficha de técnico vinculada al usuario (mismo `userId` en el tenant). */
  async findByUserId(tenantId: string, userId: string) {
    return this.prisma.technician.findFirst({
      where: { tenantId, userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /** Devuelve técnicos del tenant. `catalog` incluye cuentas de oficina; por defecto solo asignables a eventos. */
  async findAll(tenantId: string, scope: 'assignable' | 'catalog' = 'assignable') {
    const statusFilter =
      scope === 'catalog'
        ? {
            OR: [
              { status: { in: ['ACTIVE', 'FREELANCE', 'PRACTICAS'] } },
              { status: { startsWith: 'OFFICE_' } },
            ],
          }
        : { status: { in: ['ACTIVE', 'FREELANCE'] } };

    return this.prisma.technician.findMany({
      where: { tenantId, ...statusFilter },
      orderBy: { user: { email: 'asc' } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        availability: {
          orderBy: { startDate: 'asc' },
          take: 90,
        },
      },
    });
  }

  /** Devuelve disponibilidad de un técnico en un rango */
  async getAvailability(
    tenantId: string,
    technicianId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const tech = await this.prisma.technician.findFirst({
      where: { id: technicianId, tenantId },
    });
    if (!tech) throw new NotFoundException('Técnico no encontrado');

    const where: any = { technicianId, tenantId };

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    return this.prisma.technicianAvailability.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
  }

  /** Guarda o actualiza la disponibilidad para un día concreto */
  async setDayAvailability(
    tenantId: string,
    technicianId: string,
    dto: SetAvailabilityDto,
  ) {
    // Resolvemos el técnico (soportamos el alias "me" → primer técnico del tenant)
    let resolvedId = technicianId;
    if (technicianId === 'me') {
      const first = await this.prisma.technician.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      });
      if (!first) throw new NotFoundException('No hay técnicos en este tenant');
      resolvedId = first.id;
    } else {
      const tech = await this.prisma.technician.findFirst({
        where: { id: technicianId, tenantId },
      });
      if (!tech) throw new NotFoundException('Técnico no encontrado');
    }

    const dayStart = new Date(dto.date + 'T00:00:00.000Z');
    const dayEnd = new Date(dto.date + 'T23:59:59.999Z'); // fin del día para `endDate` al crear
    const dayNextUtc = new Date(dayStart);
    dayNextUtc.setUTCDate(dayNextUtc.getUTCDate() + 1);

    // Registro del mismo día civil (UTC), tolerando milisegundos en BD
    const existing = await this.prisma.technicianAvailability.findFirst({
      where: {
        technicianId: resolvedId,
        tenantId,
        startDate: { gte: dayStart, lt: dayNextUtc },
      },
    });

    if (existing) {
      return this.prisma.technicianAvailability.update({
        where: { id: existing.id },
        data: { type: dto.type, notes: dto.notes },
      });
    }

    return this.prisma.technicianAvailability.create({
      data: {
        technicianId: resolvedId,
        tenantId,
        startDate: dayStart,
        endDate: dayEnd,
        type: dto.type,
        notes: dto.notes,
      },
    });
  }

  /** Guarda disponibilidad en bloque (usado por el bot) */
  async setBulkAvailability(
    tenantId: string,
    technicianId: string,
    dto: BulkAvailabilityDto,
  ) {
    const results = await Promise.all(
      dto.slots.map((slot) =>
        this.setDayAvailability(tenantId, technicianId, slot),
      ),
    );
    return { saved: results.length, items: results };
  }

  /** Genera un plan de disponibilidad automático para un mes completo  */
  async autoPlanMonth(
    tenantId: string,
    technicianId: string,
    year: number,
    month: number,
  ) {
    const daysInMonth = new Date(year, month, 0).getDate(); // month es 1-indexed
    const slots: SetAvailabilityDto[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dow = date.getDay(); // 0=Dom,6=Sáb
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Fines de semana = UNAVAILABLE, resto = AVAILABLE
      const type = dow === 0 || dow === 6 ? 'UNAVAILABLE' : 'AVAILABLE';
      slots.push({ date: dateStr, type });
    }

    return this.setBulkAvailability(tenantId, technicianId, { slots });
  }

  async update(
    tenantId: string,
    technicianId: string,
    dto: UpdateTechnicianDto,
    actorUserId?: string,
    actorPermissions: string[] = [],
  ) {
    const tech = await this.prisma.technician.findFirst({
      where: { id: technicianId, tenantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    if (!tech) {
      throw new NotFoundException('Técnico no encontrado');
    }

    const canManageUsers =
      actorPermissions.includes('*') || actorPermissions.includes('users.manage');
    const isSelf = actorUserId != null && tech.userId === actorUserId;
    if (!canManageUsers && !isSelf) {
      throw new ForbiddenException('No tienes permiso para editar este técnico');
    }

    const userPatch: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } = {};
    if (dto.firstName !== undefined) {
      userPatch.firstName = dto.firstName.trim();
    }
    if (dto.lastName !== undefined) {
      userPatch.lastName = dto.lastName.trim();
    }
    if (dto.email !== undefined && canManageUsers) {
      userPatch.email = dto.email.trim();
    }

    if (Object.keys(userPatch).length > 0) {
      await this.prisma.user.update({
        where: { id: tech.userId },
        data: userPatch,
      });
    }

    const techPatch: {
      bio?: string | null;
      avatarUrl?: string | null;
      skills?: string[];
      status?: string;
    } = {};
    if (dto.bio !== undefined) {
      techPatch.bio = dto.bio.trim() || null;
    }
    if (dto.avatarUrl !== undefined) {
      techPatch.avatarUrl = dto.avatarUrl.trim() || null;
    }
    if (dto.skills !== undefined) {
      techPatch.skills = dto.skills.map((skill) => skill.trim().toUpperCase()).filter(Boolean);
    }
    if (dto.status !== undefined) {
      techPatch.status = dto.status.trim().toUpperCase();
    }

    return this.prisma.technician.update({
      where: { id: technicianId },
      data: techPatch,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}
