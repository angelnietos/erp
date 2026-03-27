import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommercialDocumentRepository } from '../../database/services/commercial-document.repository';
import { CommercialDocumentDocument } from '../../database/schemas/commercial-document.schema';
import { DocumentTypeValue } from '../../database/schemas/commercial-document.schema';
import { CreateCommercialDocumentDto } from './dto/create-document.dto';
import { InvoiceService } from '../invoice/invoice.service';
import { InvoiceRepository } from '../../database/services/invoice.repository';
import { SeriesService } from '../series/series.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { Impuesto } from '../dto/tipo-factura.enum';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly docRepo: CommercialDocumentRepository,
    private readonly invoiceService: InvoiceService,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly seriesService: SeriesService,
  ) {}

  async create(
    type: DocumentTypeValue,
    dto: CreateCommercialDocumentDto,
  ): Promise<CommercialDocumentDocument> {
    const existing = await this.docRepo.findByNumber(dto.documentNumber, dto.sellerNif);
    if (existing) {
      throw new BadRequestException(
        `Documento con número ${dto.documentNumber} ya existe para este vendedor`,
      );
    }
    return this.docRepo.create({
      documentType: type,
      documentNumber: dto.documentNumber,
      issueDate: new Date(dto.issueDate),
      sellerNif: dto.sellerNif,
      sellerName: dto.sellerName ?? '',
      buyerNif: dto.buyerNif,
      buyerName: dto.buyerName,
      buyerCountry: dto.buyerCountry ?? 'ES',
      description: dto.description,
      lines: dto.lines,
      taxItems: dto.taxItems.map((t) => ({
        impuesto: (t.impuesto as Impuesto) ?? Impuesto.IVA,
        tipoImpositivo: t.tipoImpositivo,
        baseImponible: t.baseImponible,
        cuota: t.cuota,
      })),
      totalAmount: dto.totalAmount,
      status: 'draft',
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      customerId: dto.customerId,
    });
  }

  async findAll(
    type: DocumentTypeValue | undefined,
    sellerNif: string | undefined,
    status: string | undefined,
    page: number,
    limit: number,
  ): Promise<{ documents: CommercialDocumentDocument[]; total: number }> {
    return this.docRepo.findAll(
      { documentType: type, sellerNif, status },
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<CommercialDocumentDocument> {
    const doc = await this.docRepo.findById(id);
    if (!doc) throw new NotFoundException(`Documento ${id} no encontrado`);
    return doc;
  }

  async update(
    id: string,
    dto: Partial<CreateCommercialDocumentDto>,
  ): Promise<CommercialDocumentDocument> {
    const doc = await this.findOne(id);
    if (doc.status === 'converted') {
      throw new BadRequestException('No se puede editar un documento ya convertido a factura');
    }
    const updated = await this.docRepo.update(id, {
      ...(dto.issueDate && { issueDate: new Date(dto.issueDate) }),
      ...(dto.sellerName !== undefined && { sellerName: dto.sellerName }),
      ...(dto.buyerNif !== undefined && { buyerNif: dto.buyerNif }),
      ...(dto.buyerName !== undefined && { buyerName: dto.buyerName }),
      ...(dto.buyerCountry !== undefined && { buyerCountry: dto.buyerCountry }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.lines && { lines: dto.lines }),
      ...(dto.taxItems && {
        taxItems: dto.taxItems.map((t) => ({
          impuesto: (t.impuesto as Impuesto) ?? Impuesto.IVA,
          tipoImpositivo: t.tipoImpositivo,
          baseImponible: t.baseImponible,
          cuota: t.cuota,
        })),
      }),
      ...(dto.totalAmount !== undefined && { totalAmount: dto.totalAmount }),
      ...(dto.validUntil && { validUntil: new Date(dto.validUntil) }),
    });
    if (!updated) throw new NotFoundException(`Documento ${id} no encontrado`);
    return updated;
  }

  async updateStatus(id: string, status: string): Promise<CommercialDocumentDocument> {
    const doc = await this.findOne(id);
    const allowed = ['draft', 'sent', 'approved', 'rejected'];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Estado no válido: ${status}`);
    }
    if (doc.status === 'converted') {
      throw new BadRequestException('El documento ya fue convertido a factura');
    }
    const updated = await this.docRepo.update(id, { status });
    if (!updated) throw new NotFoundException(`Documento ${id} no encontrado`);
    return updated;
  }

  async convertToInvoice(
    id: string,
    seriesId: string,
    sellerNif: string,
  ): Promise<{ invoiceId: string; invoiceNumber: string }> {
    const doc = await this.findOne(id);
    if (doc.status === 'converted' && doc.convertedToInvoiceId) {
      throw new BadRequestException(
        `Ya convertido a factura: ${doc.convertedToInvoiceId}`,
      );
    }
    const { invoiceNumber } = await this.seriesService.getNextNumber(seriesId, sellerNif);
    const createDto: CreateInvoiceDto = {
      invoiceNumber,
      invoiceDate: doc.issueDate.toISOString().split('T')[0],
      sellerID: doc.sellerNif,
      sellerName: doc.sellerName,
      buyerID: doc.buyerNif,
      buyerName: doc.buyerName,
      buyerCountry: doc.buyerCountry ?? 'ES',
      text: doc.description ?? `Factura desde ${doc.documentType} ${doc.documentNumber}`,
      taxItems: doc.taxItems.map((t) => ({
        impuesto: t.impuesto,
        taxRate: t.tipoImpositivo,
        taxBase: t.baseImponible,
        taxAmount: t.cuota,
      })),
      totalAmount: doc.totalAmount,
      lines: doc.lines?.map((l) => ({
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discount: l.discount,
        total: l.total,
      })),
    };
    await this.invoiceService.createInvoice(createDto);
    const created = await this.invoiceRepository.findByInvoiceNumber(
      invoiceNumber,
      sellerNif,
    );
    const invoiceId = created?._id?.toString() ?? '';
    await this.docRepo.markConverted(id, invoiceId);
    return { invoiceId, invoiceNumber };
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findOne(id);
    if (doc.status === 'converted') {
      throw new BadRequestException('No se puede eliminar un documento ya convertido a factura');
    }
    await this.docRepo.delete(id);
  }
}
