import { Injectable, inject } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-data-access';
import { ClientSummary, ClientsRepositoryPort } from '@josanz-erp/clients-core';

/**
 * Prisma Clients Repository
 * 
 * Implementation of ClientsRepositoryPort for Prisma/PostgreSQL.
 * This can be used in the NestJS backend application.
 */
@Injectable()
export class PrismaClientsRepository implements ClientsRepositoryPort {
  private readonly prisma = inject(PrismaService);

  async findAllSummaries(): Promise<ClientSummary[]> {
    return this.prisma.client.findMany({
      select: { id: true, name: true, sector: true },
    });
  }
}
