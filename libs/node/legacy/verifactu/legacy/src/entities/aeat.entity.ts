/**
 * AEAT Response Entity
 * Entidad de respuesta de AEAT
 */
export interface AeatResponseEntity {
  id: string;
  invoiceId: string;
  invoiceNumber: string;

  // Request information
  requestType: 'alta' | 'anulacion';
  requestXml: string;
  requestAt: Date;

  // Response information
  responseXml?: string;
  responseAt?: Date;
  responseCode?: string;
  responseMessage?: string;

  // Status
  status: 'pending' | 'success' | 'error' | 'rejected';
  retryCount: number;
  lastRetryAt?: Date;

  // Error details
  errorCode?: string;
  errorMessage?: string;
  errorDetails?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AEAT Submission Batch
 * Lote de envío a AEAT
 */
export interface AeatSubmissionBatch {
  id: string;
  invoiceIds: string[];
  totalInvoices: number;
  successfulCount: number;
  failedCount: number;

  // Status
  status: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';

  // Timestamps
  startedAt: Date;
  completedAt?: Date;

  // Results
  results: Array<{
    invoiceId: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * AEAT Environment Configuration
 * Configuración de entorno AEAT
 */
export interface AeatEnvironmentConfig {
  environment: 'test' | 'production';
  testUrl: string;
  productionUrl: string;
  currentUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}
