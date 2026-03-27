import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: 'apps/backend/prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
