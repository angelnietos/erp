import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: 'apps/verifactu-api/.env' });
loadEnv({ path: 'apps/backend/.env' });
loadEnv();

@Injectable()
export class VerifactuPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.VERIFACTU_DATABASE_URL ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('Missing VERIFACTU_DATABASE_URL (or DATABASE_URL) for VerifactuPrismaService');
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

