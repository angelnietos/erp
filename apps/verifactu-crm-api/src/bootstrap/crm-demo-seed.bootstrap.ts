import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@generic-crm/shared-infrastructure';
import { seedCrmDatabase } from '../../prisma/seed';

/**
 * En desarrollo, si la BD CRM está vacía (sin tenants), ejecuta el seed demo
 * para que login local y OIDC funcionen sin pasar por el hub ERP.
 */
@Injectable()
export class CrmDemoSeedBootstrap implements OnModuleInit {
  private readonly log = new Logger(CrmDemoSeedBootstrap.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    if (process.env['NODE_ENV'] === 'production') {
      return;
    }
    if (process.env['CRM_AUTO_SEED'] === 'false') {
      return;
    }

    const tenantCount = await this.prisma.tenant.count();
    if (tenantCount > 0) {
      return;
    }

    this.log.warn(
      'BD CRM sin tenants — ejecutando seed demo (admin@demo.local / Demo12345! / tenant demo).',
    );
    try {
      await seedCrmDatabase();
      this.log.log('Seed demo CRM completado.');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.log.error(
        `No se pudo ejecutar el seed automático: ${message}. ` +
          'Comprueba Postgres (pnpm run crm:db:up) y DATABASE_URL en apps/verifactu-crm-api/.env',
      );
    }
  }
}
