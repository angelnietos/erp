import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@generic-crm/prisma-client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';

const originalDbUrl = process.env['DATABASE_URL'];
loadEnv({ path: 'apps/verifactu-crm-api/.env' });
const crmDbUrl = process.env['VERIFACTU_DATABASE_URL'];
if (originalDbUrl) process.env['DATABASE_URL'] = originalDbUrl;
if (crmDbUrl) process.env['VERIFACTU_DATABASE_URL'] = crmDbUrl;

@Injectable()
export class VerifactuPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env['VERIFACTU_DATABASE_URL'];
    if (!connectionString) {
      throw new Error('Missing VERIFACTU_DATABASE_URL for VerifactuPrismaService');
    }
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

