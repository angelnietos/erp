export const verifactuPaths = {
  queue: 'verifactu/queue',
  series: 'verifactu/series',
  logs: 'verifactu/logs',
  integration: 'verifactu/integration',
  settings: 'verifactu/settings',
  credentialsStatus: 'verifactu/credentials/status',
  credentials: 'verifactu/credentials',
  invoiceDetail: (id: string) => `verifactu/invoices/${id}`,
  chain: 'verifactu/chain',
  chainVerify: 'verifactu/chain/verify',
} as const;
