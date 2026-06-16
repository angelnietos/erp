import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import {
  AuditLogWriterService,
  PiiCryptoService,
  PrismaService,
  requireRequestTenantId,
  requireRequestUserId,
} from '@josanz-erp/shared-infrastructure';
import { Request } from 'express';
import {
  CreatePrivacyRequestBody,
  PrivacyRequestDto,
  PrivacyRequestStatus,
  PrivacyRequestType,
  ReviewPrivacyRequestBody,
} from './privacy-request.dto';

function mapRow(row: {
  id: string;
  tenantId: string;
  requesterUserId: string;
  type: string;
  status: string;
  subjectType: string | null;
  subjectId: string | null;
  userMessage: string | null;
  dpoNotes: string | null;
  legalHold: Prisma.JsonValue;
  reviewedByUserId: string | null;
  reviewedAt: Date | null;
  completedAt: Date | null;
  resultSummary: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): PrivacyRequestDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    requesterUserId: row.requesterUserId,
    type: row.type as PrivacyRequestDto['type'],
    status: row.status as PrivacyRequestDto['status'],
    subjectType: row.subjectType as PrivacyRequestDto['subjectType'],
    subjectId: row.subjectId,
    userMessage: row.userMessage,
    dpoNotes: row.dpoNotes,
    legalHold: row.legalHold as Record<string, unknown> | null,
    reviewedByUserId: row.reviewedByUserId,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    resultSummary: row.resultSummary as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class PrivacyRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditWriter: AuditLogWriterService,
    private readonly piiCrypto: PiiCryptoService,
  ) {}

  async createRequest(
    req: Request,
    body: CreatePrivacyRequestBody,
  ): Promise<PrivacyRequestDto> {
    const userId = requireRequestUserId(req);
    const tenantId = requireRequestTenantId(req);
    this.assertValidType(body.type);

    const subjectType =
      body.subjectType ??
      (body.type === 'ACCOUNT_ERASURE' ? 'SELF' : undefined);
    const subjectId =
      body.subjectId ??
      (subjectType === 'SELF' ? userId : undefined);

    if (body.type === 'CLIENT_ERASURE' && !body.subjectId) {
      throw new BadRequestException('subjectId requerido para borrado de cliente');
    }

    const row = await this.prisma.privacyRequest.create({
      data: {
        tenantId,
        requesterUserId: userId,
        type: body.type,
        status: 'PENDING',
        subjectType: subjectType ?? null,
        subjectId: subjectId ?? null,
        userMessage: body.userMessage?.slice(0, 4000) ?? null,
      },
    });

    await this.auditWriter.record(userId, {
      action: 'PRIVACY_REQUEST_CREATE',
      targetEntity: `PrivacyRequest:${row.id}`,
      tenantId,
      ipAddress: this.clientIp(req),
      userAgent: req.headers['user-agent'],
      changesJson: {
        entityType: 'PRIVACY',
        details: `Solicitud DPO ${body.type}`,
      },
    });

    return mapRow(row);
  }

  async listMyRequests(req: Request): Promise<PrivacyRequestDto[]> {
    const userId = requireRequestUserId(req);
    const tenantId = requireRequestTenantId(req);
    const rows = await this.prisma.privacyRequest.findMany({
      where: { tenantId, requesterUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map(mapRow);
  }

  async listQueue(
    tenantId: string,
    status?: PrivacyRequestStatus,
  ): Promise<PrivacyRequestDto[]> {
    const rows = await this.prisma.privacyRequest.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map(mapRow);
  }

  async getById(tenantId: string, id: string): Promise<PrivacyRequestDto> {
    const row = await this.prisma.privacyRequest.findFirst({
      where: { id, tenantId },
    });
    if (!row) throw new NotFoundException('Solicitud no encontrada');
    return mapRow(row);
  }

  async reviewRequest(
    req: Request,
    id: string,
    body: ReviewPrivacyRequestBody,
  ): Promise<PrivacyRequestDto> {
    const reviewerId = requireRequestUserId(req);
    const tenantId = requireRequestTenantId(req);
    const allowed: PrivacyRequestStatus[] = [
      'IN_REVIEW',
      'APPROVED',
      'REJECTED',
    ];
    if (!allowed.includes(body.status)) {
      throw new BadRequestException('Estado de revisión no válido');
    }

    const existing = await this.prisma.privacyRequest.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Solicitud no encontrada');
    if (existing.status === 'COMPLETED' || existing.status === 'PARTIAL') {
      throw new BadRequestException('La solicitud ya fue ejecutada');
    }

    const row = await this.prisma.privacyRequest.update({
      where: { id },
      data: {
        status: body.status,
        dpoNotes: body.dpoNotes?.slice(0, 8000) ?? existing.dpoNotes,
        reviewedByUserId: reviewerId,
        reviewedAt: new Date(),
      },
    });

    await this.auditWriter.record(reviewerId, {
      action: 'PRIVACY_REQUEST_REVIEW',
      targetEntity: `PrivacyRequest:${id}`,
      tenantId,
      ipAddress: this.clientIp(req),
      changesJson: {
        entityType: 'PRIVACY',
        details: `Revisión DPO → ${body.status}`,
      },
    });

    return mapRow(row);
  }

  async executeRequest(req: Request, id: string): Promise<PrivacyRequestDto> {
    const actorId = requireRequestUserId(req);
    const tenantId = requireRequestTenantId(req);

    const existing = await this.prisma.privacyRequest.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Solicitud no encontrada');
    if (existing.status !== 'APPROVED') {
      throw new BadRequestException(
        'Solo se pueden ejecutar solicitudes APPROVED',
      );
    }

    const result = await this.runErasure(existing, tenantId);
    const finalStatus = result.partial ? 'PARTIAL' : 'COMPLETED';

    const row = await this.prisma.privacyRequest.update({
      where: { id },
      data: {
        status: finalStatus,
        legalHold: result.legalHold as Prisma.InputJsonValue,
        resultSummary: result.summary as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });

    await this.auditWriter.record(actorId, {
      action: 'PRIVACY_REQUEST_EXECUTE',
      targetEntity: `PrivacyRequest:${id}`,
      tenantId,
      ipAddress: this.clientIp(req),
      changesJson: {
        entityType: 'PRIVACY',
        details: `Ejecución DPO ${existing.type} → ${finalStatus}`,
      },
    });

    return mapRow(row);
  }

  private async runErasure(
    request: {
      type: string;
      subjectType: string | null;
      subjectId: string | null;
      requesterUserId: string;
    },
    tenantId: string,
  ): Promise<{
    partial: boolean;
    legalHold: Record<string, unknown>;
    summary: Record<string, unknown>;
  }> {
    const type = request.type as PrivacyRequestType;

    switch (type) {
      case 'TELEMETRY_ERASURE':
        return this.eraseTelemetry(
          request.subjectId ?? request.requesterUserId,
          tenantId,
        );
      case 'ACCOUNT_ERASURE':
        return this.eraseAccount(
          request.subjectId ?? request.requesterUserId,
          tenantId,
        );
      case 'CLIENT_ERASURE':
        if (!request.subjectId) {
          throw new BadRequestException('subjectId requerido');
        }
        return this.eraseClient(request.subjectId, tenantId);
      case 'DATA_EXPORT':
        throw new BadRequestException(
          'DATA_EXPORT se resuelve vía GET /privacy/export/* sin ejecución destructiva',
        );
      default:
        throw new BadRequestException(`Tipo no ejecutable: ${type}`);
    }
  }

  private async eraseTelemetry(userId: string, tenantId: string) {
    const result = await this.prisma.aiInsight.updateMany({
      where: { userId, tenantId },
      data: {
        userEmail: null,
        sessionId: null,
        summary: '[anonimizado RGPD]',
        metadata: { anonymizedAt: new Date().toISOString() },
      },
    });
    return {
      partial: false,
      legalHold: {},
      summary: { anonymizedInsights: result.count },
    };
  }

  private async eraseAccount(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const invoiceCount = await this.prisma.invoice.count({
      where: { tenantId },
    });

    const anonTag = createHash('sha256')
      .update(`${userId}:${Date.now()}`)
      .digest('hex')
      .slice(0, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `anon-${anonTag}@deleted.local`,
        firstName: '[anonimizado]',
        lastName: '[RGPD]',
        isActive: false,
        password: randomBytes(32).toString('hex'),
      },
    });

    const telemetry = await this.eraseTelemetry(userId, tenantId);

    const partial = invoiceCount > 0;
    return {
      partial,
      legalHold: {
        invoicesRetained: invoiceCount,
        reason: 'Obligación legal de conservación fiscal (Verifactu)',
      },
      summary: {
        userAnonymized: true,
        anonymizedInsights: telemetry.summary.anonymizedInsights,
      },
    };
  }

  private async eraseClient(clientId: string, tenantId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, tenantId, deletedAt: null },
      include: {
        budgets: { include: { invoices: true } },
      },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    let invoiceCount = 0;
    for (const b of client.budgets) {
      invoiceCount += b.invoices?.length ?? 0;
    }

    const anonName = `[Cliente anonimizado ${clientId.slice(0, 8)}]`;

    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        name: anonName,
        description: null,
        taxId: this.piiCrypto.encryptField(null),
        email: this.piiCrypto.encryptField(null),
        phone: this.piiCrypto.encryptField(null),
        address: this.piiCrypto.encryptField(null),
        deletedAt: new Date(),
      },
    });

    await this.prisma.clientContact.updateMany({
      where: { clientId, tenantId },
      data: {
        name: '[contacto anonimizado]',
        email: this.piiCrypto.encryptField(null),
        phone: this.piiCrypto.encryptField(null),
        notes: this.piiCrypto.encryptField(null),
      },
    });

    return {
      partial: invoiceCount > 0,
      legalHold: {
        invoicesRetained: invoiceCount,
        budgetsRetained: client.budgets.length,
        reason: 'Facturas y presupuestos sujetos a conservación legal',
      },
      summary: {
        clientAnonymized: true,
        clientId,
      },
    };
  }

  private assertValidType(type: string): void {
    const valid: PrivacyRequestType[] = [
      'ACCOUNT_ERASURE',
      'CLIENT_ERASURE',
      'DATA_EXPORT',
      'TELEMETRY_ERASURE',
      'OTHER',
    ];
    if (!valid.includes(type as PrivacyRequestType)) {
      throw new BadRequestException('Tipo de solicitud no válido');
    }
  }

  private clientIp(req: Request): string | undefined {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress
    );
  }
}
