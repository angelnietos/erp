/**
 * Certificate Entity
 * Entidad de Certificado Digital
 */
export interface CertificateEntity {
  id: string;
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  thumbprint: string;
  nif: string;
  companyName: string;

  // File information
  filePath: string;
  fileName: string;
  fileSize: number;

  // Status
  isActive: boolean;
  isExpired: boolean;
  expiresAt: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Certificate Status
 * Estado del certificado
 */
export interface CertificateStatus {
  isValid: boolean;
  isExpired: boolean;
  expiresAt: Date;
  daysUntilExpiry: number;
  warnings: string[];
  errors: string[];
}

/**
 * Certificate Usage Log
 * Registro de uso del certificado
 */
export interface CertificateUsageLog {
  id: string;
  certificateId: string;
  action: 'sign' | 'encrypt' | 'decrypt' | 'verify';
  performedAt: Date;
  performedBy: string;
  ipAddress?: string;
  success: boolean;
  errorMessage?: string;
}
