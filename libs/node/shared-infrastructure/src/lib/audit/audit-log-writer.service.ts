import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogWriterService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    userId: string,
    input: {
      action: string;
      targetEntity: string;
      changesJson?: Prisma.InputJsonValue;
      tenantId?: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<void> {
    try {
      const base =
        input.changesJson && typeof input.changesJson === 'object' && !Array.isArray(input.changesJson)
          ? (input.changesJson as Record<string, unknown>)
          : {};
      const changesJson: Prisma.InputJsonValue = {
        ...base,
        ...(input.tenantId ? { tenantId: input.tenantId } : {}),
        ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
        ...(input.userAgent ? { userAgent: input.userAgent.slice(0, 512) } : {}),
      };

      await this.prisma.auditLog.create({
        data: {
          userId,
          action: input.action,
          targetEntity: input.targetEntity,
          correlationId: randomUUID(),
          changesJson,
          tenantId: input.tenantId ?? null,
          ipAddress: input.ipAddress?.slice(0, 45) ?? null,
          userAgent: input.userAgent?.slice(0, 512) ?? null,
        },
      });
      console.log(`[AuditLogWriter] Recorded ${input.action} for user ${userId} on ${input.targetEntity}`);
    } catch (err) {
      console.error(`[AuditLogWriter] Failed to record audit log for user ${userId}:`, err);
      // We don't throw to avoid breaking the main business flow if audit logging fails
    }
  }
}
