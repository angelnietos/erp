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
    },
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: input.action,
          targetEntity: input.targetEntity,
          correlationId: randomUUID(),
          changesJson: (input.changesJson ?? {}) as Prisma.InputJsonValue,
        },
      });
      console.log(`[AuditLogWriter] Recorded ${input.action} for user ${userId} on ${input.targetEntity}`);
    } catch (err) {
      console.error(`[AuditLogWriter] Failed to record audit log for user ${userId}:`, err);
      // We don't throw to avoid breaking the main business flow if audit logging fails
    }
  }
}
