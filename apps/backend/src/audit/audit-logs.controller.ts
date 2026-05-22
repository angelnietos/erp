import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import {
  JwtAuthGuard,
  PrismaService,
  requireRequestTenantId,
} from '@josanz-erp/shared-infrastructure';

export interface AuditLogApiRow {
  id: string;
  userName: string;
  action: string;
  entity: string;
  entityName?: string;
  timestamp: string;
  details?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  targetEntity: string;
}

function inferEntityFromTarget(targetEntity: string): string {
  const head = targetEntity.split(':')[0]?.toLowerCase() ?? '';
  if (head.includes('project')) return 'PROJECT';
  if (head.includes('client')) return 'CLIENT';
  if (head.includes('service')) return 'SERVICE';
  if (head.includes('auth')) return 'USER';
  return 'PROJECT';
}

function mapRow(
  row: {
    id: string;
    action: string;
    targetEntity: string;
    changesJson: Prisma.JsonValue;
    createdAt: Date;
  },
  userName: string,
): AuditLogApiRow {
  const c =
    row.changesJson && typeof row.changesJson === 'object' && !Array.isArray(row.changesJson)
      ? (row.changesJson as Record<string, unknown>)
      : {};
  const entityType =
    typeof c['entityType'] === 'string' ? c['entityType'] : inferEntityFromTarget(row.targetEntity);
  const entityName = typeof c['entityName'] === 'string' ? c['entityName'] : undefined;
  const details = typeof c['details'] === 'string' ? c['details'] : undefined;
  const changes = c['changes'] as Record<string, { old: unknown; new: unknown }> | undefined;

  return {
    id: row.id,
    userName,
    action: row.action,
    entity: entityType,
    entityName,
    timestamp: row.createdAt.toISOString(),
    details: details ?? row.action,
    changes,
    targetEntity: row.targetEntity,
  };
}

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar registros de auditoría del tenant (actividad real persistida)',
  })
  async list(@Req() req: Request, @Query('limit') limit?: string): Promise<AuditLogApiRow[]> {
    const tenantId = requireRequestTenantId(req);
    const n = Math.min(500, Math.max(1, parseInt(limit || '100', 10) || 100));

    const tenantUsers = await this.prisma.user.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const userIds = tenantUsers.map((u) => u.id);
    if (userIds.length === 0) {
      return [];
    }

    const rows = await this.prisma.auditLog.findMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { changesJson: { path: ['tenantId'], equals: tenantId } },
        ],
        action: { not: 'SEED' },
      },
      orderBy: { createdAt: 'desc' },
      take: n,
    });

    console.log(`[AuditLogsController] Found ${rows.length} rows for tenant ${tenantId} (users: ${userIds.length})`);

    const users = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(rows.map((r) => r.userId))] } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const nameById = new Map(
      users.map((u) => {
        const parts = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
        return [u.id, parts || u.email] as const;
      }),
    );

    return rows.map((r) =>
      mapRow(r, nameById.get(r.userId) ?? 'Usuario'),
    );
  }
}
