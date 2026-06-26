const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  // Simulate what VerifactuPrismaService does
  const originalDbUrl = process.env['DATABASE_URL'];
  console.log('Original DATABASE_URL:', originalDbUrl);
  
  // Load CRM .env
  require('dotenv').config({ path: 'apps/verifactu-crm-api/.env' });
  const crmDbUrl = process.env['DATABASE_URL'];
  console.log('CRM DATABASE_URL after load:', crmDbUrl);
  
  // Restore original
  if (originalDbUrl) process.env['DATABASE_URL'] = originalDbUrl;
  
  // Set VERIFACTU_DATABASE_URL
  if (crmDbUrl) process.env['VERIFACTU_DATABASE_URL'] = crmDbUrl;
  
  console.log('VERIFACTU_DATABASE_URL:', process.env['VERIFACTU_DATABASE_URL']);
  
  // Now test connection using prisma client directly
  const { PrismaClient } = require('.prisma/crm-client');
  const client = new PrismaClient({ 
    adapter: new PrismaPg({ connectionString: process.env['VERIFACTU_DATABASE_URL'] }) 
  });
  
  try {
    const result = await client.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webhook_endpoints'`;
    console.log('Table exists check:', result);
    
    const tenants = await client.tenant.findMany({ take: 1 });
    console.log('Tenants found:', tenants.length);
    
    const count = await client.verifactuWebhookEndpoint.count();
    console.log('Webhook endpoint count:', count);
  } catch (e) {
    console.log('Error:', e.message || e);
  } finally {
    await client.$disconnect();
  }
}
main();