import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PrismaService,
  AuditLogWriterService,
  PiiCryptoService,
  requireRequestTenantId,
  requireRequestUserId,
} from '@josanz-erp/shared-infrastructure';
import { Request } from 'express';
import { PrivacySecurityStatusDto } from './privacy-status.dto';
import { BusinessDataExportDto } from './privacy-request.dto';
import {
  DPIA_ACTION_PLAN,
  DPIA_RISKS,
  DpiaDocumentDto,
  ROPA_RIGHTS,
  ROPA_TREATMENTS,
  RopaDocumentDto,
} from './privacy-compliance.data';

export interface PrivacyPolicyDto {
  version: string;
  lawfulBasis: string[];
  retentionDays: Record<string, number>;
  dataCategories: string[];
  rights: string[];
  contactDpo: string;
}

export interface UserDataExportDto {
  exportedAt: string;
  userId: string;
  tenantId: string;
  profile: Record<string, unknown> | null;
  auditActivity: unknown[];
  aiTelemetry: unknown[];
  note: string;
}

@Injectable()
export class PrivacyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditWriter: AuditLogWriterService,
    private readonly config: ConfigService,
    private readonly piiCrypto: PiiCryptoService,
  ) {}

  getPolicy(): PrivacyPolicyDto {
    return {
      version: '2026-06',
      lawfulBasis: [
        'Ejecución de contrato (ERP operativo)',
        'Interés legítimo (seguridad, auditoría)',
        'Obligación legal (facturación / Verifactu)',
      ],
      retentionDays: {
        audit_logs: 730,
        domain_events: Number(process.env['DOMAIN_EVENTS_RETENTION_DAYS'] ?? 365),
        ai_insights: 365,
        invoices: 2555,
      },
      dataCategories: [
        'Identificación (nombre, email)',
        'Contacto (teléfono, dirección)',
        'Fiscal (NIF/CIF)',
        'Laboral (disponibilidad, bajas)',
        'Telemetría IA (interacciones con bots)',
      ],
      rights: [
        'Acceso (exportación)',
        'Rectificación (perfil / módulos CRM)',
        'Supresión / anonimización (telemetría IA)',
        'Portabilidad (JSON)',
        'Oposición (contactar DPO)',
      ],
      contactDpo: process.env['DPO_CONTACT_EMAIL'] ?? 'dpo@josanz.com',
    };
  }

  getSecurityStatus(): PrivacySecurityStatusDto {
    const policy = this.getPolicy();
    const piiKey =
      this.config.get<string>('PII_ENCRYPTION_KEY') ??
      this.config.get<string>('WEBHOOK_ENCRYPTION_KEY');
    return {
      encryptionAtRest: !!piiKey && piiKey.length >= 32,
      piiRedactionEnabled: true,
      auditInterceptorEnabled: true,
      auditRetentionDays: parseInt(
        this.config.get<string>('AUDIT_LOG_RETENTION_DAYS') ?? '730',
        10,
      ),
      domainEventsRetentionDays: parseInt(
        this.config.get<string>('DOMAIN_EVENTS_RETENTION_DAYS') ?? '365',
        10,
      ),
      policyVersion: policy.version,
    };
  }

  getRopa(): RopaDocumentDto {
    const policy = this.getPolicy();
    return {
      version: policy.version,
      updatedAt: '2026-06-16',
      dpoContact: policy.contactDpo,
      treatments: ROPA_TREATMENTS,
      dataSubjectRights: ROPA_RIGHTS,
      markdownPath: 'docs/compliance/ROPA.md',
    };
  }

  getDpia(): DpiaDocumentDto {
    return {
      version: '2026-06',
      updatedAt: '2026-06-16',
      conclusion:
        'Tratamiento ADMISIBLE con controles implementados; Key Vault y DPA en producción obligatorios.',
      acceptable: true,
      risks: DPIA_RISKS,
      actionPlan: DPIA_ACTION_PLAN,
      markdownPath: 'docs/compliance/DPIA.md',
    };
  }

  async exportMyData(req: Request): Promise<UserDataExportDto> {
    const userId = requireRequestUserId(req);
    const tenantId = requireRequestTenantId(req);

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        roles: { include: { role: { select: { name: true } } } },
      },
    });

    const auditRows = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const aiRows = await this.prisma.aiInsight.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    await this.auditWriter.record(userId, {
      action: 'PRIVACY_EXPORT',
      targetEntity: `User:${userId}`,
      tenantId,
      ipAddress: this.clientIp(req),
      userAgent: req.headers['user-agent'],
      changesJson: {
        details: 'Exportación RGPD de datos personales (art. 15)',
        entityType: 'PRIVACY',
      },
    });

    return {
      exportedAt: new Date().toISOString(),
      userId,
      tenantId,
      profile: user ? (user as Record<string, unknown>) : null,
      auditActivity: auditRows,
      aiTelemetry: aiRows,
      note:
        'Exportación parcial: datos de negocio (clientes, facturas) se gestionan según obligaciones legales de conservación.',
    };
  }

  async anonymizeMyTelemetry(req: Request): Promise<{ ok: true; anonymizedInsights: number }> {
    const userId = requireRequestUserId(req);
    const tenantId = requireRequestTenantId(req);

    const result = await this.prisma.aiInsight.updateMany({
      where: { userId, tenantId },
      data: {
        userEmail: null,
        sessionId: null,
        summary: '[anonimizado RGPD]',
        metadata: { anonymizedAt: new Date().toISOString() },
      },
    });

    await this.auditWriter.record(userId, {
      action: 'PRIVACY_ERASURE',
      targetEntity: `User:${userId}`,
      tenantId,
      ipAddress: this.clientIp(req),
      userAgent: req.headers['user-agent'],
      changesJson: {
        details: `Anonimización telemetría IA (${result.count} filas)`,
        entityType: 'PRIVACY',
      },
    });

    return { ok: true, anonymizedInsights: result.count };
  }

  async exportUserDataAdmin(
    req: Request,
    targetUserId: string,
  ): Promise<BusinessDataExportDto> {
    const actorId = requireRequestUserId(req);
    const tenantId = requireRequestTenantId(req);

    const user = await this.prisma.user.findFirst({
      where: { id: targetUserId, tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        roles: { include: { role: { select: { name: true } } } },
      },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const auditRows = await this.prisma.auditLog.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
    const aiRows = await this.prisma.aiInsight.findMany({
      where: { userId: targetUserId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });

    await this.auditWriter.record(actorId, {
      action: 'PRIVACY_ADMIN_EXPORT',
      targetEntity: `User:${targetUserId}`,
      tenantId,
      ipAddress: this.clientIp(req),
      changesJson: {
        entityType: 'PRIVACY',
        details: 'Exportación RGPD admin (usuario)',
      },
    });

    return {
      exportedAt: new Date().toISOString(),
      exportedBy: actorId,
      tenantId,
      subjectType: 'USER',
      subjectId: targetUserId,
      data: {
        profile: user,
        auditActivity: auditRows,
        aiTelemetry: aiRows,
      },
      legalRetentionNote:
        'Datos de facturación del tenant no incluidos; conservación según obligación legal.',
    };
  }

  async exportClientDataAdmin(
    req: Request,
    clientId: string,
  ): Promise<BusinessDataExportDto> {
    const actorId = requireRequestUserId(req);
    const tenantId = requireRequestTenantId(req);

    const client = await this.prisma.client.findFirst({
      where: { id: clientId, tenantId },
      include: {
        contacts: true,
        budgets: {
          include: {
            invoices: {
              select: {
                id: true,
                invoiceNumber: true,
                status: true,
                total: true,
                createdAt: true,
              },
            },
            deliveryNotes: {
              select: { id: true, status: true, createdAt: true },
            },
          },
        },
        eventReports: { take: 50, orderBy: { createdAt: 'desc' } },
        rentals: { take: 50, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const decrypted = {
      ...client,
      taxId: this.piiCrypto.decryptField(client.taxId),
      email: this.piiCrypto.decryptField(client.email),
      phone: this.piiCrypto.decryptField(client.phone),
      address: this.piiCrypto.decryptField(client.address),
      contacts: client.contacts.map((c) => ({
        ...c,
        email: this.piiCrypto.decryptField(c.email),
        phone: this.piiCrypto.decryptField(c.phone),
        notes: this.piiCrypto.decryptField(c.notes),
      })),
    };

    const invoiceIds: string[] = [];
    for (const b of client.budgets) {
      for (const inv of b.invoices) {
        invoiceIds.push(inv.id);
      }
    }
    const verifactuLogs =
      invoiceIds.length > 0
        ? await this.prisma.verifactuLog.findMany({
            where: { tenantId, invoiceId: { in: invoiceIds } },
            orderBy: { createdAt: 'desc' },
            take: 100,
          })
        : [];

    const invoiceSummary = {
      count: invoiceIds.length,
      totalAmount: client.budgets.reduce(
        (sum, b) => sum + b.invoices.reduce((s, i) => s + (i.total ?? 0), 0),
        0,
      ),
    };

    await this.auditWriter.record(actorId, {
      action: 'PRIVACY_ADMIN_EXPORT',
      targetEntity: `Client:${clientId}`,
      tenantId,
      ipAddress: this.clientIp(req),
      changesJson: {
        entityType: 'PRIVACY',
        details: 'Exportación RGPD admin (cliente / datos de negocio)',
      },
    });

    return {
      exportedAt: new Date().toISOString(),
      exportedBy: actorId,
      tenantId,
      subjectType: 'CLIENT',
      subjectId: clientId,
      data: {
        client: decrypted,
        invoiceSummary,
        verifactuComplianceLogs: verifactuLogs,
      },
      legalRetentionNote:
        'Facturas incluidas como metadatos; PDF/XML conservados según Verifactu (6+ años).',
    };
  }

  private clientIp(req: Request): string | undefined {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress
    );
  }
}
