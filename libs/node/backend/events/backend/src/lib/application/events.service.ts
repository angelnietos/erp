import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogWriterService, PrismaService } from '@josanz-erp/shared-infrastructure';
import type { Prisma } from '@prisma/client';
import { canUserDeleteEvent } from './event-delete.policy';

export interface EventVenueBlock {
  salon?: string;
  subsala?: string;
  setupDate?: string;
  setupTime?: string;
  teardownDate?: string;
  teardownTime?: string;
}

export interface EventDateBlock {
  date: string;
  time?: string;
}

export interface EventWriteBody {
  name?: string;
  clientId?: string;
  operatorContactId?: string;
  typology?: string;
  startDate?: string;
  endDate?: string;
  eventTime?: string;
  eventSchedule?: EventDateBlock[];
  location?: string;
  venueSchedule?: EventVenueBlock[];
  status?: string;
  statusPillColor?: string;
  notes?: string;
  summary?: string;
  budgetAddress?: string;
  budgetContact?: string;
  budgetObservations?: string;
  technicianIds?: string[];
  detailNotes?: EventDetailNoteInput[];
  emails?: EventDetailEmailInput[];
  attachments?: EventDetailAttachmentInput[];
  budgetLines?: EventBudgetLineInput[];
}

export interface EventDetailNoteInput {
  kind: 'EVENT' | 'STAFF';
  text: string;
}

export interface EventDetailEmailInput {
  sentAt?: string;
  subject: string;
  body: string;
}

export interface EventDetailAttachmentInput {
  category: 'INSPIRATION' | 'DELIVERY' | 'INVOICE' | 'REPORT';
  filename: string;
  storageKey?: string;
}

export interface EventBudgetLineInput {
  units: number;
  materialName: string;
  warehouse: string;
  status: string;
  price: number;
  days: number;
  coef: number;
  discount: number;
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
      include: this.detailInclude(),
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
        createdByUserId: actorUserId,
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

    await this.prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id },
        data: payload,
      });
      await this.syncNestedDetails(tx, tenantId, id, data);
    });

    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: this.detailInclude(),
    });
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

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

  async updateStatus(
    tenantId: string,
    id: string,
    data: { status: string; statusPillColor?: string | null },
    actorUserId: string,
  ) {
    const existing = await this.ensureExists(tenantId, id);
    const nextStatus = data.status?.trim() || 'DRAFT';
    const nextPillColor =
      data.statusPillColor === undefined
        ? undefined
        : data.statusPillColor?.trim() || null;

    await this.prisma.event.update({
      where: { id },
      data: {
        status: nextStatus,
        ...(nextPillColor !== undefined ? { statusPillColor: nextPillColor } : {}),
      },
    });

    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: this.defaultInclude(),
    });
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    await this.auditLogWriter.record(actorUserId, {
      action: 'UPDATE',
      targetEntity: `Event:${event.id}`,
      tenantId,
      changesJson: {
        entityType: 'EVENT',
        entityName: event.name,
        details: `Estado cambiado de ${existing.status} a ${nextStatus}`,
        statusFrom: existing.status,
        statusTo: nextStatus,
      },
    });

    return this.mapToDto(event);
  }

  async delete(
    tenantId: string,
    id: string,
    actorUserId: string,
    actorRoles: string[],
    actorPermissions: string[],
  ) {
    const row = await this.prisma.event.findFirst({
      where: { id, tenantId },
      select: { id: true, name: true, status: true, createdByUserId: true },
    });
    if (!row) {
      throw new NotFoundException('Evento no encontrado');
    }
    if (
      !canUserDeleteEvent(
        row.createdByUserId,
        actorUserId,
        actorRoles,
        actorPermissions,
      )
    ) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este evento',
      );
    }
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
      client: { select: { id: true, name: true, sector: true, railColor: true } },
      operatorContact: { select: { id: true, name: true, email: true, phone: true } },
    } as const;
  }

  private detailInclude() {
    return {
      ...this.defaultInclude(),
      eventNotes: { orderBy: { sortOrder: 'asc' as const } },
      eventEmails: { orderBy: { createdAt: 'asc' as const } },
      attachments: { orderBy: { createdAt: 'asc' as const } },
      budgetLines: { orderBy: { sortOrder: 'asc' as const } },
      technicians: {
        include: {
          technician: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      },
    } as const;
  }

  private async syncNestedDetails(
    tx: Prisma.TransactionClient,
    tenantId: string,
    eventId: string,
    data: EventWriteBody,
  ): Promise<void> {
    if (data.technicianIds !== undefined) {
      await tx.eventTechnician.deleteMany({ where: { eventId } });
      const ids = data.technicianIds.filter(Boolean);
      if (ids.length) {
        const valid = await tx.technician.findMany({
          where: { tenantId, id: { in: ids } },
          select: { id: true },
        });
        const validIds = new Set(valid.map((t) => t.id));
        const rows = ids.filter((id) => validIds.has(id)).map((technicianId) => ({
          eventId,
          technicianId,
        }));
        if (rows.length) {
          await tx.eventTechnician.createMany({ data: rows, skipDuplicates: true });
        }
      }
    }

    if (data.detailNotes !== undefined) {
      await tx.eventNote.deleteMany({ where: { eventId } });
      const notes = data.detailNotes
        .map((note, index) => ({
          tenantId,
          eventId,
          kind: note.kind,
          text: note.text.trim(),
          sortOrder: index,
        }))
        .filter((note) => note.text);
      if (notes.length) {
        await tx.eventNote.createMany({ data: notes });
      }
    }

    if (data.emails !== undefined) {
      await tx.eventEmail.deleteMany({ where: { eventId } });
      const emails = data.emails
        .map((email) => ({
          tenantId,
          eventId,
          sentAt: email.sentAt?.trim() || null,
          subject: email.subject.trim() || 'Sin asunto',
          body: email.body.trim(),
        }))
        .filter((email) => email.body || email.subject);
      if (emails.length) {
        await tx.eventEmail.createMany({ data: emails });
      }
    }

    if (data.attachments !== undefined) {
      await tx.eventAttachment.deleteMany({ where: { eventId } });
      const attachments = data.attachments
        .map((file) => ({
          tenantId,
          eventId,
          category: file.category,
          filename: file.filename.trim(),
          storageKey: file.storageKey?.trim() || null,
        }))
        .filter((file) => file.filename);
      if (attachments.length) {
        await tx.eventAttachment.createMany({ data: attachments });
      }
    }

    if (data.budgetLines !== undefined) {
      await tx.eventBudgetLine.deleteMany({ where: { eventId } });
      const lines = data.budgetLines.map((line, index) => ({
        tenantId,
        eventId,
        units: line.units ?? 0,
        materialName: line.materialName?.trim() ?? '',
        warehouse: line.warehouse?.trim() ?? '',
        status: line.status?.trim() ?? '',
        price: line.price ?? 0,
        days: line.days ?? 0,
        coef: line.coef ?? 0,
        discount: line.discount ?? 0,
        sortOrder: index,
      }));
      if (lines.length) {
        await tx.eventBudgetLine.createMany({ data: lines });
      }
    }
  }

  private async ensureExists(tenantId: string, id: string) {
    const row = await this.prisma.event.findFirst({
      where: { id, tenantId },
      select: { id: true, name: true, status: true },
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

  private normalizeEventSchedule(data: EventWriteBody): EventDateBlock[] {
    const fromSchedule = (data.eventSchedule ?? [])
      .map((slot) => ({
        date: slot.date?.trim() ?? '',
        time: (slot.time?.trim() || '00:00').slice(0, 5),
      }))
      .filter((slot) => slot.date);
    if (fromSchedule.length) {
      return fromSchedule;
    }
    if (data.startDate?.trim()) {
      return [
        {
          date: data.startDate.trim(),
          time: (data.eventTime?.trim() || '00:00').slice(0, 5),
        },
      ];
    }
    return [];
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
    if (data.statusPillColor !== undefined) {
      payload.statusPillColor = data.statusPillColor?.trim() || null;
    }
    if (data.notes !== undefined) {
      payload.notes = data.notes?.trim() || null;
    }
    if (data.summary !== undefined) {
      payload.summary = data.summary?.trim() || null;
    }
    if (data.budgetAddress !== undefined) {
      payload.budgetAddress = data.budgetAddress?.trim() || null;
    }
    if (data.budgetContact !== undefined) {
      payload.budgetContact = data.budgetContact?.trim() || null;
    }
    if (data.budgetObservations !== undefined) {
      payload.budgetObservations = data.budgetObservations?.trim() || null;
    }
    if (data.venueSchedule !== undefined) {
      payload.venueSchedule = data.venueSchedule as unknown as Prisma.InputJsonValue;
    }
    if (data.eventSchedule !== undefined) {
      payload.eventSchedule = data.eventSchedule as unknown as Prisma.InputJsonValue;
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
      const schedule = this.normalizeEventSchedule(data);
      const primary = schedule[0];
      const start = this.parseDateTime(
        primary?.date ?? data.startDate,
        primary?.time ?? data.eventTime,
      );
      payload.startDate = start;
      const last = schedule[schedule.length - 1];
      if (data.endDate) {
        payload.endDate = this.parseDateTime(data.endDate, data.eventTime);
      } else if (last && schedule.length > 1) {
        payload.endDate = this.parseDateTime(last.date, last.time);
      } else if (!eventId) {
        payload.endDate = start;
      }
      if (schedule.length) {
        payload.eventSchedule = schedule as unknown as Prisma.InputJsonValue;
        payload.eventTime = (primary?.time ?? data.eventTime)?.trim() || null;
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
    eventSchedule?: unknown;
    status: string;
    statusPillColor?: string | null;
    location: string | null;
    venueSchedule: unknown;
    notes: string | null;
    summary: string | null;
    budgetAddress?: string | null;
    budgetContact?: string | null;
    budgetObservations?: string | null;
    createdAt: Date;
    createdByUserId?: string | null;
    client?: { id: string; name: string; sector?: string | null; railColor?: string | null } | null;
    operatorContact?: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
    } | null;
    eventNotes?: Array<{ id: string; kind: string; text: string; sortOrder: number }>;
    eventEmails?: Array<{ id: string; sentAt: string | null; subject: string; body: string }>;
    attachments?: Array<{ id: string; category: string; filename: string; storageKey: string | null }>;
    budgetLines?: Array<{
      id: string;
      units: number;
      materialName: string;
      warehouse: string;
      status: string;
      price: number;
      days: number;
      coef: number;
      discount: number;
      sortOrder: number;
    }>;
    technicians?: Array<{
      technicianId: string;
      technician: {
        id: string;
        avatarUrl: string | null;
        status: string;
        user: { id: string; firstName: string; lastName: string; email: string };
      };
    }>;
  }) {
    const technicianName = (user: { firstName: string; lastName: string }) =>
      `${user.firstName} ${user.lastName}`.trim();

    return {
      id: event.id,
      name: event.name,
      clientId: event.clientId,
      operatorContactId: event.operatorContactId,
      typology: event.typology,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      eventTime: event.eventTime,
      eventSchedule: (event.eventSchedule as EventDateBlock[] | null) ?? [],
      status: event.status,
      statusPillColor: event.statusPillColor ?? null,
      location: event.location,
      venueSchedule: (event.venueSchedule as EventVenueBlock[] | null) ?? [],
      notes: event.notes,
      summary: event.summary,
      budgetAddress: event.budgetAddress ?? null,
      budgetContact: event.budgetContact ?? null,
      budgetObservations: event.budgetObservations ?? null,
      createdAt: event.createdAt.toISOString(),
      createdByUserId: event.createdByUserId ?? null,
      client: event.client ?? null,
      operator: event.operatorContact
        ? {
            id: event.operatorContact.id,
            name: event.operatorContact.name,
            email: event.operatorContact.email,
            phone: event.operatorContact.phone,
          }
        : null,
      eventNotes: (event.eventNotes ?? [])
        .filter((n) => n.kind === 'EVENT')
        .map((n) => ({ id: n.id, text: n.text })),
      staffNotes: (event.eventNotes ?? [])
        .filter((n) => n.kind === 'STAFF')
        .map((n) => ({ id: n.id, text: n.text })),
      technicians: (event.technicians ?? []).map((row) => ({
        id: row.technician.id,
        name: technicianName(row.technician.user),
        role: row.technician.status === 'ACTIVE' ? 'Técnico' : row.technician.status,
        avatarUrl: row.technician.avatarUrl,
      })),
      emails: (event.eventEmails ?? []).map((email) => ({
        id: email.id,
        date: email.sentAt ?? '',
        subject: email.subject,
        body: email.body,
      })),
      attachments: (event.attachments ?? []).map((file) => ({
        id: file.id,
        category: file.category,
        filename: file.filename,
        storageKey: file.storageKey,
      })),
      budgetLines: (event.budgetLines ?? []).map((line) => ({
        id: line.id,
        units: line.units,
        materialName: line.materialName,
        warehouse: line.warehouse,
        status: line.status,
        price: line.price,
        days: line.days,
        coef: line.coef,
        discount: line.discount,
      })),
    };
  }
}
