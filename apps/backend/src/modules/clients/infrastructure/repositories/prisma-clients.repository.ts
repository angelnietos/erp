import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { ClientSummary, ClientsRepositoryPort } from '@josanz-erp/clients-core';

@Injectable()
export class PrismaClientsRepository implements ClientsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllSummaries(): Promise<ClientSummary[]> {
    return this.prisma.client.findMany({
      select: { id: true, name: true, sector: true },
    });
  }
}

