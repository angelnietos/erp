import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'apps/backend/prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // Alineado con package.json: --project usa module commonjs y evita el aviso MODULE_TYPELESS_PACKAGE_JSON.
  migrations: {
    seed: 'npx ts-node --project apps/backend/tsconfig.app.json apps/backend/prisma/seed.ts',
  },
});
