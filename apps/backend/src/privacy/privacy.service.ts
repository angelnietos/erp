import { Injectable } from '@nestjs/common';
import {
  PrismaService,
  AuditLogWriterService,
  requireRequestTenantId,
  requireRequestUserId,
} from '@josanz-erp/shared-infrastructure';
import { Request } from 'express';

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

  private clientIp(req: Request): string | undefined {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress
    );
  }
}
