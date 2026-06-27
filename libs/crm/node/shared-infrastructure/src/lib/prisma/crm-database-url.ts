import { config as loadEnv } from 'dotenv';
import { join } from 'path';

/** Carga `.env` del CRM (cwd monorepo o app). */
export function loadCrmEnvFiles(): void {
  loadEnv({ path: join(process.cwd(), 'apps/verifactu-crm-api/.env') });
  loadEnv({ path: join(process.cwd(), '.env') });
}

/** Prisma y seed: `VERIFACTU_DATABASE_URL` tiene prioridad sobre `DATABASE_URL` del monorepo (ERP). */
export function resolveCrmDatabaseUrl(): string {
  loadCrmEnvFiles();
  const url =
    process.env['VERIFACTU_DATABASE_URL']?.trim() ||
    process.env['DATABASE_URL']?.trim() ||
    '';
  if (!url) {
    throw new Error(
      'DATABASE_URL (o VERIFACTU_DATABASE_URL) es obligatorio para el CRM Verifactu.',
    );
  }
  return url;
}
