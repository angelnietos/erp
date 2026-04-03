import { Injectable, Logger } from '@nestjs/common';
import { HashService } from '../hash/hash.service';
import { CreateInvoiceDto, CancelInvoiceDto } from '@josanz-erp/verifactu-api';

/**
 * Blockchain record interface
 */
export interface BlockchainRecord {
  id: string;
  sellerNif: string;
  invoiceNumber: string;
  invoiceDate: string;
  type: 'alta' | 'anulacion';
  hash: string;
  previousHash: string;
  timestamp: string;
  invoiceData?: CreateInvoiceDto | CancelInvoiceDto;
  createdAt: Date;
}

/**
 * Blockchain Service - Manages the chain of invoice records
 * Servicio de Blockchain - Gestiona la cadena de registros de facturas
 */
@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private chains: Map<string, BlockchainRecord[]> = new Map();

  constructor(private hashService: HashService) {}

  /**
   * Get or create blockchain for a seller
   * Obtener o crear blockchain para un vendedor
   */
  getBlockchain(sellerNif: string): BlockchainRecord[] {
    if (!this.chains.has(sellerNif)) {
      this.chains.set(sellerNif, []);
    }
    return this.chains.get(sellerNif)!;
  }

  /**
   * Get the last record in the blockchain for a seller
   * Obtener el último registro en la blockchain de un vendedor
   */
  getLastRecord(sellerNif: string): BlockchainRecord | null {
    const chain = this.getBlockchain(sellerNif);
    if (chain.length === 0) {
      return null;
    }
    return chain[chain.length - 1];
  }

  /**
   * Get the previous hash for a new record
   * Obtener el hash anterior para un nuevo registro
   */
  getPreviousHash(sellerNif: string): string {
    const lastRecord = this.getLastRecord(sellerNif);
    if (!lastRecord) {
      return this.hashService.generateInitialHash();
    }
    return lastRecord.hash;
  }

  /**
   * Add invoice registration record to blockchain
   * Añadir registro de alta de factura a la blockchain
   */
  addRegistroAlta(invoice: CreateInvoiceDto): BlockchainRecord {
    const chain = this.getBlockchain(invoice.sellerID);
    const previousHash = this.getPreviousHash(invoice.sellerID);
    const timestamp = this.hashService.generateTimestamp();

    // Formatting and totals for hash
    const formattedDate = this.hashService.formatDateForHash(
      invoice.invoiceDate,
    );
    const cuotaTotal = this.hashService.calculateCuotaTotal(invoice.taxItems);
    const totalAmount =
      invoice.totalAmount ||
      this.hashService.calculateTotalAmount(invoice.taxItems);

    const hash = this.hashService.generateRegistroAltaHash({
      sellerNif: invoice.sellerID,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: formattedDate,
      invoiceType: invoice.invoiceType || 'F1',
      cuotaTotal,
      totalAmount,
      previousHash,
      timestamp,
    });

    const record: BlockchainRecord = {
      id: this.generateId(),
      sellerNif: invoice.sellerID,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      type: 'alta',
      hash,
      previousHash,
      timestamp,
      invoiceData: invoice,
      createdAt: new Date(),
    };

    chain.push(record);
    this.logger.log(
      `Added RegistroAlta to blockchain: ${invoice.invoiceNumber} for ${invoice.sellerID}`,
    );

    return record;
  }

  /**
   * Add invoice cancellation record to blockchain
   * Añadir registro de anulación de factura a la blockchain
   */
  addRegistroAnulacion(cancellation: CancelInvoiceDto): BlockchainRecord {
    const chain = this.getBlockchain(cancellation.sellerID);
    const previousHash = this.getPreviousHash(cancellation.sellerID);
    const timestamp = this.hashService.generateTimestamp();

    const formattedDate = this.hashService.formatDateForHash(
      cancellation.invoiceDate,
    );

    const hash = this.hashService.generateRegistroAnulacionHash({
      sellerNif: cancellation.sellerID,
      invoiceNumber: cancellation.invoiceNumber,
      invoiceDate: formattedDate,
      previousHash,
      timestamp,
    });

    const record: BlockchainRecord = {
      id: this.generateId(),
      sellerNif: cancellation.sellerID,
      invoiceNumber: cancellation.invoiceNumber,
      invoiceDate: cancellation.invoiceDate,
      type: 'anulacion',
      hash,
      previousHash,
      timestamp,
      invoiceData: cancellation,
      createdAt: new Date(),
    };

    chain.push(record);
    this.logger.log(
      `Added RegistroAnulacion to blockchain: ${cancellation.invoiceNumber} for ${cancellation.sellerID}`,
    );

    return record;
  }

  /**
   * Get record by invoice number
   * Obtener registro por número de factura
   */
  getRecordByInvoiceNumber(
    sellerNif: string,
    invoiceNumber: string,
  ): BlockchainRecord | null {
    const chain = this.getBlockchain(sellerNif);
    return chain.find((r) => r.invoiceNumber === invoiceNumber) || null;
  }

  /**
   * Get all records for a seller
   * Obtener todos los registros de un vendedor
   */
  getAllRecords(sellerNif: string): BlockchainRecord[] {
    return this.getBlockchain(sellerNif);
  }

  /**
   * Verify blockchain integrity
   * Verificar integridad de la blockchain
   */
  verifyBlockchain(sellerNif: string): boolean {
    const chain = this.getBlockchain(sellerNif);

    for (let i = 0; i < chain.length; i++) {
      const record = chain[i];
      const expectedPreviousHash =
        i === 0 ? this.hashService.generateInitialHash() : chain[i - 1].hash;

      if (record.previousHash !== expectedPreviousHash) {
        this.logger.error(`Blockchain integrity check failed at record ${i}`);
        return false;
      }

      // Verify hash calculation
      const invoice = record.invoiceData as CreateInvoiceDto;
      const formattedDate = this.hashService.formatDateForHash(
        record.invoiceDate,
      );
      const cuotaTotal =
        record.type === 'alta'
          ? this.hashService.calculateCuotaTotal(invoice.taxItems)
          : 0;
      const totalAmount =
        record.type === 'alta'
          ? invoice.totalAmount ||
            this.hashService.calculateTotalAmount(invoice.taxItems)
          : 0;

      const expectedHash =
        record.type === 'alta'
          ? this.hashService.generateRegistroAltaHash({
              sellerNif: record.sellerNif,
              invoiceNumber: record.invoiceNumber,
              invoiceDate: formattedDate,
              invoiceType: invoice.invoiceType || 'F1',
              cuotaTotal,
              totalAmount,
              previousHash: record.previousHash,
              timestamp: record.timestamp,
            })
          : this.hashService.generateRegistroAnulacionHash({
              sellerNif: record.sellerNif,
              invoiceNumber: record.invoiceNumber,
              invoiceDate: formattedDate,
              previousHash: record.previousHash,
              timestamp: record.timestamp,
            });

      if (record.hash !== expectedHash) {
        this.logger.error(`Hash verification failed at record ${i}`);
        return false;
      }
    }

    this.logger.log(`Blockchain integrity verified for ${sellerNif}`);
    return true;
  }

  /**
   * Clear blockchain for a seller (use with caution!)
   * Limpiar blockchain de un vendedor (¡usar con precaución!)
   */
  clearBlockchain(sellerNif: string): void {
    this.chains.delete(sellerNif);
    this.logger.warn(`Blockchain cleared for ${sellerNif}`);
  }

  /**
   * Generate unique ID for records
   * Generar ID único para registros
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get chain statistics
   * Obtener estadísticas de la cadena
   */
  getChainStats(sellerNif: string): {
    totalRecords: number;
    altaCount: number;
    anulacionCount: number;
    firstRecordDate: Date | null;
    lastRecordDate: Date | null;
  } {
    const chain = this.getBlockchain(sellerNif);

    return {
      totalRecords: chain.length,
      altaCount: chain.filter((r) => r.type === 'alta').length,
      anulacionCount: chain.filter((r) => r.type === 'anulacion').length,
      firstRecordDate: chain.length > 0 ? chain[0].createdAt : null,
      lastRecordDate:
        chain.length > 0 ? chain[chain.length - 1].createdAt : null,
    };
  }
}
