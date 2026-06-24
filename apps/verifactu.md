Current Architecture:

verifactu-crm-api - Standalone NestJS backend for Verifactu with:
Prisma schema with Tenant, Invoice, VerifactuQueueItem, VerifactuLog, VerifactuTenantCredential, VerifactuAeatChainHead, VerifactuChainBlock, VerifactuSeries, VerifactuCustomer, OutboxEvent, and user/roles models
Imported modules from @generic-crm/* for shared infrastructure, identity, clients, invoicing, and verifactu backend
verifactu-worker - Worker application that processes the queue:
Polls for PENDING/FAILED items every 10 seconds
Submits invoices via VerifactuService
Syncs status back to ERP via CrmErpInvoiceMirrorHttpClient
Notifies webhooks
Has exponential backoff retry logic
verifactu-platform - Angular frontend app:
Login with Keycloak or local auth
Dashboard with records table, stats, manual submission form
Shows compliance data, QR codes, certificates
Uses VerifactuStore and VerifactuApiService
verifactu-adapters - Shared library with adapters:
AEAT clients (mock and real SOAP)
Prisma services
Webhook notifier
Security guards (API key, internal sync)
HTTP clients
verifactu-core - Isomorphic business logic:
VerifactuService with submit logic
XML builder for AEAT SOAP
Hash chain service
QR code service
Ports for AEAT client, invoice repository, webhooks
Key gaps I've identified for VERIFACTU certification compliance:

Rectificativas (Rectifications): The schema has invoice_kind, rectifies_invoice_id, rectification_type, rectification_reason but the services/controllers still have stub implementations
Anulaciones (Cancellations): cancelInvoice in VerifactuRuntimeFacade is just a stub
AEAT Integration: Only MockAeatClient is implemented; RealAeatClient exists but may need enhancement for real AEAT SOAP calls with certificate handling
Chain Verification: The VerifactuChainService exists but isn't integrated into the worker flow for verification before submission
Idempotency: Not implemented (mentioned in the hexagonal plan but not in code)
Outbox Pattern: The schema has OutboxEvent table but it's not being used
Multi-tenant API keys: The VERIFACTU_REQUIRE_API_KEY env var exists but actual multi-tenant API key management is not in the schema (needs tenant_api_keys table)
Webhook signature verification: The guard exists but let me check if it's fully implemented
I need to examine the actual AEAT requirements to identify what's missing beyond these gaps.