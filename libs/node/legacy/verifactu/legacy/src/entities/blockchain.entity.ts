import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { CancelInvoiceDto } from '../dto/cancel-invoice.dto';

/**
 * Blockchain Record Entity
 * Registro de Blockchain para integridad de facturas
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
 * Blockchain Chain Entity
 * Cadena completa de registros blockchain
 */
export interface BlockchainChain {
  records: BlockchainRecord[];
  lastHash: string;
  totalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Blockchain Verification Result
 * Resultado de verificación de cadena blockchain
 */
export interface BlockchainVerificationResult {
  isValid: boolean;
  totalRecords: number;
  verifiedAt: Date;
  errors: Array<{
    recordId: string;
    error: string;
  }>;
}
