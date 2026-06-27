/**
 * Ejecuta Prisma CLI contra la BD CRM (`generic_crm`), no la del ERP en `.env` raíz.
 * Uso: node scripts/crm-prisma.mjs migrate deploy
 */
import { config } from 'dotenv';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
config({ path: join(root, '.env') });
config({ path: join(root, 'apps/verifactu-crm-api/.env'), override: true });

process.env.DATABASE_URL =
  process.env.VERIFACTU_DATABASE_URL?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  '';

if (!process.env.DATABASE_URL) {
  console.error(
    'VERIFACTU_DATABASE_URL (o DATABASE_URL) es obligatorio en apps/verifactu-crm-api/.env',
  );
  process.exit(1);
}

const prismaArgs = ['prisma', ...process.argv.slice(2), '--schema=apps/verifactu-crm-api/prisma/schema.prisma'];
const result = spawnSync('npx', prismaArgs, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
