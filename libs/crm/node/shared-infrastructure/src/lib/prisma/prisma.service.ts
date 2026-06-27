import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@generic-crm/prisma-client';
import { PrismaPg } from '@prisma/adapter-pg';
import { resolveCrmDatabaseUrl } from './crm-database-url';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = resolveCrmDatabaseUrl();
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
