import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import { TechniciansService } from '../technicians/technicians.service';
import type { CreateTimeOffRequestDto } from './time-off.dto';

function enumerateDatesInclusive(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  const a = new Date(`${startIso}T12:00:00`);
  const b = new Date(`${endIso}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || a > b) {
    return [];
  }
  for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}

function buildSlotsForApproved(row: {
  kind: string;
  absenceSubtype: string | null;
  notes: string | null;
  startDate: Date;
  endDate: Date;
}): { date: string; type: string; notes?: string }[] {
  const startIso = row.startDate.toISOString().slice(0, 10);
  const endIso = row.endDate.toISOString().slice(0, 10);
  const dates = enumerateDatesInclusive(startIso, endIso);
  const extra = (row.notes ?? '').trim();
  let type = 'SICK_LEAVE';
  let notes = extra;
  if (row.kind === 'VACATION') {
    type = 'HOLIDAY';
  } else if (row.absenceSubtype === 'sick') {
    type = 'SICK_LEAVE';
    notes = [extra, 'Ausencia médica'].filter(Boolean).join(' — ');
  } else if (row.absenceSubtype === 'permit') {
    type = 'UNAVAILABLE';
    notes = [extra, 'Permiso retribuido / asuntos propios'].filter(Boolean).join(' — ');
  } else if (row.absenceSubtype === 'legal') {
    type = 'UNAVAILABLE';
    notes = [extra, 'Permiso legal'].filter(Boolean).join(' — ');
  } else {
    type = 'SICK_LEAVE';
  }
  return dates.map((date) =>
    notes
      ? { date, type, notes }
      : { date, type },
  );
}

@Injectable()
export class TimeOffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly techniciansService: TechniciansService,
  ) {}

  async create(
    tenantId: string,
    requesterUserId: string,
    dto: CreateTimeOffRequestDto,
    canManageOthers: boolean,
  ) {
    const start = new Date(dto.startDate + 'T12:00:00.000Z');
    const end = new Date(dto.endDate + 'T12:00:00.000Z');
    if (start > end) {
      throw new BadRequestException('La fecha de inicio debe ser anterior al fin');
    }
    if (dto.kind === 'ABSENCE' && !dto.absenceSubtype) {
      throw new BadRequestException('Indica el tipo de ausencia');
    }

    let technicianId = dto.technicianId;
    if (technicianId) {
      if (!canManageOthers) {
        throw new ForbiddenException(
          'No puedes solicitar días para otra persona; solo RRHH puede hacerlo.',
        );
      }
      const tech = await this.prisma.technician.findFirst({
        where: { id: technicianId, tenantId },
      });
      if (!tech) {
        throw new BadRequestException('Técnico no válido en este tenant');
      }
    } else {
      const mine = await this.prisma.technician.findFirst({
        where: { tenantId, userId: requesterUserId },
      });
      if (!mine) {
        throw new BadRequestException(
          'Tu usuario no tiene ficha de técnico; contacta con administración.',
        );
      }
      technicianId = mine.id;
    }

    return this.prisma.timeOffRequest.create({
      data: {
        tenantId,
        technicianId: technicianId!,
        requesterUserId,
        kind: dto.kind,
        absenceSubtype: dto.kind === 'ABSENCE' ? dto.absenceSubtype ?? null : null,
        startDate: new Date(dto.startDate + 'T00:00:00.000Z'),
        endDate: new Date(dto.endDate + 'T00:00:00.000Z'),
        notes: dto.notes?.trim() || null,
        status: 'PENDING',
      },
      include: {
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });
  }

  listMine(tenantId: string, requesterUserId: string) {
    return this.prisma.timeOffRequest.findMany({
      where: { tenantId, requesterUserId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        technician: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
  }

  listPending(tenantId: string) {
    return this.prisma.timeOffRequest.findMany({
      where: { tenantId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        technician: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        requester: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async approve(
    tenantId: string,
    id: string,
    reviewerUserId: string,
    canManage: boolean,
  ) {
    if (!canManage) {
      throw new ForbiddenException('Solo personal autorizado puede aprobar solicitudes');
    }
    const row = await this.prisma.timeOffRequest.findFirst({
      where: { id, tenantId, status: 'PENDING' },
    });
    if (!row) {
      throw new NotFoundException('Solicitud no encontrada o ya resuelta');
    }

    const slots = buildSlotsForApproved({
      kind: row.kind,
      absenceSubtype: row.absenceSubtype,
      notes: row.notes,
      startDate: row.startDate,
      endDate: row.endDate,
    });
    if (!slots.length) {
      throw new BadRequestException('Rango de fechas inválido');
    }

    try {
      await this.techniciansService.setBulkAvailability(tenantId, row.technicianId, {
        slots,
      });
      return this.prisma.timeOffRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          decidedAt: new Date(),
          decidedByUserId: reviewerUserId,
        },
      });
    } catch (e) {
      console.error('approve time-off bulk failed', e);
      throw new BadRequestException(
        'No se pudo aplicar al cuadrante. Revisa datos o inténtalo de nuevo.',
      );
    }
  }

  async reject(
    tenantId: string,
    id: string,
    reviewerUserId: string,
    canManage: boolean,
  ) {
    if (!canManage) {
      throw new ForbiddenException('Solo personal autorizado puede rechazar solicitudes');
    }
    const row = await this.prisma.timeOffRequest.findFirst({
      where: { id, tenantId, status: 'PENDING' },
    });
    if (!row) {
      throw new NotFoundException('Solicitud no encontrada o ya resuelta');
    }
    return this.prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        decidedAt: new Date(),
        decidedByUserId: reviewerUserId,
      },
    });
  }
}
