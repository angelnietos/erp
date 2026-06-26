const pg = require('pg');
async function main() {
  // Check ERP database (port 5435)
  const erp = new pg.Client({connectionString: 'postgresql://postgres:postgres@localhost:5435/josanz_erp?schema=public'});
  await erp.connect();
  const erpTables = await erp.query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['public']);
  console.log('ERP DB tables:', erpTables.rows.map(r => r.tablename));
  await erp.end();
  
  // Check CRM database (port 55432)
  const crm = new pg.Client({connectionString: 'postgresql://postgres:postgres@localhost:55432/generic_crm?schema=public'});
  await crm.connect();
  const crmTables = await crm.query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['public']);
  console.log('CRM DB tables:', crmTables.rows.map(r => r.tablename));
  await crm.end();
}
main().catch(e => { console.log('Error:', e.message); process.exit(1); });