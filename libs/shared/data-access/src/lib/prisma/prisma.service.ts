/**
 * PrismaService — wraps PrismaClient as a NestJS injectable singleton.
 * Handles connect/disconnect lifecycle automatically.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
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
  private _extendedClient: any;

  constructor(private readonly cls: ClsService) {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('Missing DATABASE_URL environment variable for Prisma');
    }

    super({
      adapter: new PrismaPg({ connectionString }),
    });

    this._extendedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenantId = (cls as any).get('tenantId');
            const tenantModels = [
              'Client',
              'Product',
              'Budget',
              'DeliveryNote',
              'User',
              'Role',
              'Invoice',
              'VerifactuQueueItem',
              'VerifactuLog',
            ];

            if (tenantId && model && tenantModels.includes(model)) {
              const anyArgs = args as any;
              
              // Handle where clause for reads/updates/deletes
              if (!['create', 'createMany'].includes(operation)) {
                anyArgs.where = anyArgs.where || {};
                anyArgs.where.tenantId = tenantId;
              }

              // Handle data for creates
              if (['create', 'createMany'].includes(operation)) {
                if (Array.isArray(anyArgs.data)) {
                  anyArgs.data.forEach((item: any) => {
                    item.tenantId = tenantId;
                  });
                } else {
                  anyArgs.data = anyArgs.data || {};
                  anyArgs.data.tenantId = tenantId;
                }
              }
            }
            return query(args);
          },
        },
      },
    });

    // Proxy calls to the extended client to maintain singleton behavior
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target._extendedClient) {
          return target._extendedClient[prop as any];
        }
        return (target as any)[prop];
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
