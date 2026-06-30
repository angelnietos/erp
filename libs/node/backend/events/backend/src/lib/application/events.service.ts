import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogWriterService, PrismaService } from '@josanz-erp/shared-infrastructure';
import type { Prisma } from '@prisma/client';

export interface EventVenueBlock {
  salon?: string;
  subsala?: string;
  setupDate?: string;
  setupTime?: string;
  teardownDate?: string;
  teardownTime?: string;
}

export interface EventWriteBody {
  name?: string;
  clientId?: string;
  operatorContactId?: string;
  typology?: string;
  startDate?: string;
  endDate?: string;
  eventTime?: string;
  location?: string;
  venueSchedule?: EventVenueBlock[];
  status?: string;
  notes?: string;
  summary?: string;
}

const TYPOLOGY_MAP: Record<string, string> = {
  'evento externo': 'EXTERNAL',
  externos: 'EXTERNAL',
  external: 'EXTERNAL',
  hotel: 'HOTEL',
  hoteles: 'HOTEL',
  espacio: 'SPACE',
  espacios: 'SPACE',
};

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogWriter: AuditLogWriterService,
  ) {}

  async findAll(tenantId: string, clientId?: string) {
    const events = await this.prisma.event.findMany({
      where: {
        tenantId,
        ...(clientId ? { clientId } : {}),
      },
      include: this.defaultInclude(),
      orderBy: { startDate: 'desc' },
    });
    return events.map((e) => this.mapToDto(e));
  }

  async findOne(tenantId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: this.defaultInclude(),
    });
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }
    return this.mapToDto(event);
  }

  async create(tenantId: string, data: EventWriteBody, actorUserId: string) {
    if (!data.name?.trim()) {
      throw new BadRequestException('El nombre del evento es obligatorio');
    }
    if (!data.clientId?.trim()) {
      throw new BadRequestException('El cliente es obligatorio');
    }
    if (!data.startDate?.trim()) {
      throw new BadRequestException('La fecha del evento es obligatoria');
    }
    const payload = await this.buildWritePayload(tenantId, data);
    const event = await this.prisma.event.create({
      data: {
        tenantId,
        ...payload,
      } as Prisma.EventUncheckedCreateInput,
      include: this.defaultInclude(),
    });
    await this.auditLogWriter.record(actorUserId, {
      action: 'CREATE',
      targetEntity: `Event:${event.id}`,
      tenantId,
      changesJson: {
        entityType: 'EVENT',
        entityName: event.name,
        details: 'Evento creado',
      },
    });
    return this.mapToDto(event);
  }

  async update(
    tenantId: string,
    id: string,
    data: EventWriteBody,
    actorUserId: string,
  ) {
    await this.ensureExists(tenantId, id);
    const payload = await this.buildWritePayload(tenantId, data, id);
    const event = await this.prisma.event.update({
      where: { id },
      data: payload,
      include: this.defaultInclude(),
    });
    await this.auditLogWriter.record(actorUserId, {
      action: 'UPDATE',
      targetEntity: `Event:${event.id}`,
      tenantId,
      changesJson: {
        entityType: 'EVENT',
        entityName: event.name,
        details: 'Evento actualizado',
      },
    });
    return this.mapToDto(event);
  }

  async delete(tenantId: string, id: string, actorUserId: string) {
    const row = await this.ensureExists(tenantId, id);
    await this.prisma.event.delete({ where: { id } });
    await this.auditLogWriter.record(actorUserId, {
      action: 'DELETE',
      targetEntity: `Event:${id}`,
      tenantId,
      changesJson: {
        entityType: 'EVENT',
        entityName: row.name,
        details: 'Evento eliminado',
      },
    });
    return { success: true };
  }

  private defaultInclude() {
    return {
      client: { select: { id: true, name: true } },
      operatorContact: { select: { id: true, name: true, email: true, phone: true } },
    } as const;
  }

  private async ensureExists(tenantId: string, id: string) {
    const row = await this.prisma.event.findFirst({
      where: { id, tenantId },
      select: { id: true, name: true },
    });
    if (!row) {
      throw new NotFoundException('Evento no encontrado');
    }
    return row;
  }

  private normalizeTypology(value?: string): string {
    const raw = (value ?? 'EXTERNAL').trim();
    const mapped = TYPOLOGY_MAP[raw.toLowerCase()];
    if (mapped) {
      return mapped;
    }
    const upper = raw.toUpperCase();
    if (['EXTERNAL', 'HOTEL', 'SPACE'].includes(upper)) {
      return upper;
    }
    return 'EXTERNAL';
  }

  private parseDateTime(dateStr: string, timeStr?: string): Date {
    const date = dateStr.trim();
    if (!date) {
      throw new BadRequestException('La fecha del evento es obligatoria');
    }
    const time = (timeStr ?? '00:00').trim() || '00:00';
    const iso = `${date}T${time}:00`;
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Fecha u hora del evento no válidas');
    }
    return parsed;
  }

  private async buildWritePayload(
    tenantId: string,
    data: EventWriteBody,
    eventId?: string,
  ): Promise<Prisma.EventUncheckedUpdateInput> {
    const payload: Prisma.EventUncheckedUpdateInput = {};

    if (data.name !== undefined) {
      payload.name = data.name.trim() || 'Nuevo evento';
    }
    if (data.typology !== undefined) {
      payload.typology = this.normalizeTypology(data.typology);
    }
    if (data.location !== undefined) {
      payload.location = data.location?.trim() || null;
    }
    if (data.eventTime !== undefined) {
      payload.eventTime = data.eventTime?.trim() || null;
    }
    if (data.status !== undefined) {
      payload.status = data.status?.trim() || 'DRAFT';
    }
    if (data.notes !== undefined) {
      payload.notes = data.notes?.trim() || null;
    }
    if (data.summary !== undefined) {
      payload.summary = data.summary?.trim() || null;
    }
    if (data.venueSchedule !== undefined) {
      payload.venueSchedule = data.venueSchedule as unknown as Prisma.InputJsonValue;
    }

    if (data.clientId !== undefined) {
      const clientId = data.clientId?.trim();
      if (!clientId) {
        payload.clientId = null;
      } else {
        const client = await this.prisma.client.findFirst({
          where: { id: clientId, tenantId, deletedAt: null },
        });
        if (!client) {
          throw new BadRequestException('Cliente no encontrado');
        }
        payload.clientId = clientId;
      }
    }

    if (data.operatorContactId !== undefined) {
      const operatorId = data.operatorContactId?.trim();
      if (!operatorId) {
        payload.operatorContactId = null;
      } else {
        const operator = await this.prisma.clientContact.findFirst({
          where: {
            id: operatorId,
            tenantId,
            ...(data.clientId ? { clientId: data.clientId.trim() } : {}),
          },
        });
        if (!operator) {
          throw new BadRequestException('Operador no encontrado para el cliente');
        }
        payload.operatorContactId = operatorId;
      }
    }

    if (data.startDate !== undefined) {
      const start = this.parseDateTime(data.startDate, data.eventTime);
      payload.startDate = start;
      if (data.endDate) {
        payload.endDate = this.parseDateTime(data.endDate, data.eventTime);
      } else if (!eventId) {
        payload.endDate = start;
      }
    }

    return payload;
  }

  private mapToDto(event: {
    id: string;
    name: string;
    clientId: string | null;
    operatorContactId: string | null;
    typology: string;
    startDate: Date;
    endDate: Date;
    eventTime: string | null;
    status: string;
    location: string | null;
    venueSchedule: unknown;
    notes: string | null;
    summary: string | null;
    createdAt: Date;
    client?: { id: string; name: string } | null;
    operatorContact?: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
    } | null;
  }) {
    return {
      id: event.id,
      name: event.name,
      clientId: event.clientId,
      operatorContactId: event.operatorContactId,
      typology: event.typology,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      eventTime: event.eventTime,
      status: event.status,
      location: event.location,
      venueSchedule: (event.venueSchedule as EventVenueBlock[] | null) ?? [],
      notes: event.notes,
      summary: event.summary,
      createdAt: event.createdAt.toISOString(),
      client: event.client ?? null,
      operator: event.operatorContact
        ? {
            id: event.operatorContact.id,
            name: event.operatorContact.name,
            email: event.operatorContact.email,
            phone: event.operatorContact.phone,
          }
        : null,
    };
  }
}
