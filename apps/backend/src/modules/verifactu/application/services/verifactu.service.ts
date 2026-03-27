import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AEAT_CLIENT,
  AeatClientPort,
} from '../../domain/ports/aeat-client.port';
import {
  VERIFACTU_INVOICE_REPOSITORY,
  VerifactuInvoiceRepositoryPort,
} from '../../domain/ports/verifactu-invoice.repository.port';
import { SubmitVerifactuInvoiceDto } from '../dtos/submit-verifactu-invoice.dto';
import { HashChainService } from '../../domain/services/hash-chain.service';

@Injectable()
export class VerifactuService {
  private readonly hashChain = new HashChainService();

  constructor(
    @Inject(VERIFACTU_INVOICE_REPOSITORY)
    private readonly invoiceRepository: VerifactuInvoiceRepositoryPort,
    @Inject(AEAT_CLIENT)
    private readonly aeatClient: AeatClientPort,
  ) {}

  async submitInvoice(dto: SubmitVerifactuInvoiceDto): Promise<{
    invoiceId: string;
    tenantId: string;
    status: 'SENT' | 'ERROR';
    currentHash: string;
    previousHash?: string;
    aeatReference?: string;
  }> {
    const invoice = await this.invoiceRepository.findInvoiceById(dto.invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const previousHash = await this.invoiceRepository.getLastAcceptedHash() ?? undefined;
    const currentHash = this.hashChain.buildCurrentHash({
      invoiceId: invoice.id,
      tenantId: dto.tenantId,
      total: invoice.total,
      previousHash,
    });

    const requestPayload = {
      invoiceId: invoice.id,
      tenantId: dto.tenantId,
      total: invoice.total,
      previousHash,
      currentHash,
    };

    try {
      const aeatResponse = await this.aeatClient.submitRecord({
        invoiceId: invoice.id,
        tenantId: dto.tenantId,
        total: invoice.total,
        previousHash,
        currentHash,
      });

      await this.invoiceRepository.markInvoiceAsSent(invoice.id, currentHash, previousHash);
      await this.invoiceRepository.createSubmissionLog({
        invoiceId: invoice.id,
        requestPayload,
        responsePayload: aeatResponse.rawResponse,
        status: 'SENT',
      });

      return {
        invoiceId: invoice.id,
        tenantId: dto.tenantId,
        status: 'SENT',
        currentHash,
        previousHash,
        aeatReference: aeatResponse.aeatReference,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Verifactu error';
      await this.invoiceRepository.markInvoiceAsError(invoice.id);
      await this.invoiceRepository.createSubmissionLog({
        invoiceId: invoice.id,
        requestPayload,
        responsePayload: { error: message },
        status: 'ERROR',
        errorMessage: message,
      });

      return {
        invoiceId: invoice.id,
        tenantId: dto.tenantId,
        status: 'ERROR',
        currentHash,
        previousHash,
      };
    }
  }
}

