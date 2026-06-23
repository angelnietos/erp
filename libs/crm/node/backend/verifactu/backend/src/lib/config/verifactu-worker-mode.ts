/** Procesador de cola dentro de verifactu-crm-api (solo dev standalone CRM). */
export function isCrmQueueProcessorEnabled(): boolean {
  return process.env['VERIFACTU_CRM_QUEUE_PROCESSOR_ENABLED'] === 'true';
}

/** Cola canónica en josanz_erp + verifactu-worker (recomendado en monorepo). */
export function isErpWorkerMode(): boolean {
  return process.env['VERIFACTU_USE_ERP_WORKER'] !== 'false';
}
