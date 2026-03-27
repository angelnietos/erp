import { VerifactuService } from '@josanz-erp/verifactu-core';
import { AeatClientPort } from '@josanz-erp/verifactu-core';
import { VerifactuInvoiceRepositoryPort } from '@josanz-erp/verifactu-core';
import { WebhookNotifierPort } from '@josanz-erp/verifactu-core';

describe('VerifactuService integration flow', () => {
  it('computes hash, stores log and updates invoice as SENT', async () => {
    const repositoryCalls: string[] = [];
    const repository: VerifactuInvoiceRepositoryPort = {
      async findInvoiceById() {
        repositoryCalls.push('findInvoiceById');
        return { id: 'f2065b8b-1f57-403f-8de1-7fca4c4e7311', budgetId: 'b1', total: 120.5, currentHash: null };
      },
      async getLastAcceptedHash() {
        repositoryCalls.push('getLastAcceptedHash');
        return 'prev-hash';
      },
      async markInvoiceAsSent() {
        repositoryCalls.push('markInvoiceAsSent');
      },
      async markInvoiceAsError() {
        repositoryCalls.push('markInvoiceAsError');
      },
      async createSubmissionLog() {
        repositoryCalls.push('createSubmissionLog');
      },
    };
    const aeat: AeatClientPort = {
      async submitRecord() {
        return { accepted: true, aeatReference: 'AEAT-REF', rawResponse: { ok: true } };
      },
    };
    const webhook: WebhookNotifierPort = {
      async notify() {
        repositoryCalls.push('notifyWebhook');
      },
    };

    const service = new VerifactuService(
      repository as VerifactuInvoiceRepositoryPort,
      aeat as AeatClientPort,
      webhook as WebhookNotifierPort,
    );

    const result = await service.submitInvoice({
      invoiceId: 'f2065b8b-1f57-403f-8de1-7fca4c4e7311',
      tenantId: 'tenant-a',
    });

    expect(result.status).toBe('SENT');
    expect(result.currentHash).toBeTruthy();
    expect(repositoryCalls).toEqual([
      'findInvoiceById',
      'getLastAcceptedHash',
      'markInvoiceAsSent',
      'createSubmissionLog',
      'notifyWebhook',
    ]);
  });
});

