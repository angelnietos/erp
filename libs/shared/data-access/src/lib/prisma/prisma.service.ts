/**
 * PrismaService — wraps PrismaClient as a NestJS injectable singleton.
 * Handles connect/disconnect lifecycle automatically.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ClsService } from 'nestjs-cls';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: 'apps/backend/.env' });
loadEnv();

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly cls: ClsService) {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('Missing DATABASE_URL environment variable for Prisma');
    }

    super({
      adapter: new PrismaPg({ connectionString }),
    });

    this.applyTenantMiddleware();
  }

  private applyTenantMiddleware() {
    this.$use(async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
      const tenantModels = ['Client', 'Product', 'Budget', 'DeliveryNote', 'User', 'Role', 'Invoice'];
      const tenantActions = ['findUnique', 'findFirst', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate', 'groupBy'];
      
      if (params.model && tenantModels.includes(params.model) && tenantActions.includes(params.action)) {
        const tenantId = this.cls.get('tenantId');
        if (tenantId) {
          params.args = params.args || {};
          // Merge tenantId logically:
          params.args.where = { ...params.args.where, tenantId };
        }
      }

      // For creates, automatically append tenantId if missing
      if (params.model && tenantModels.includes(params.model) && ['create', 'createMany'].includes(params.action)) {
        const tenantId = this.cls.get('tenantId');
        if (tenantId) {
          params.args = params.args || {};
          params.args.data = { ...params.args.data, tenantId };
        }
      }

      return next(params);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
