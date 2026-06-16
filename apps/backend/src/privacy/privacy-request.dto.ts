export type PrivacyRequestType =
  | 'ACCOUNT_ERASURE'
  | 'CLIENT_ERASURE'
  | 'DATA_EXPORT'
  | 'TELEMETRY_ERASURE'
  | 'OTHER';

export type PrivacyRequestStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'PARTIAL';

export type PrivacySubjectType = 'USER' | 'CLIENT' | 'SELF';

export interface PrivacyRequestDto {
  id: string;
  tenantId: string;
  requesterUserId: string;
  type: PrivacyRequestType;
  status: PrivacyRequestStatus;
  subjectType: PrivacySubjectType | null;
  subjectId: string | null;
  userMessage: string | null;
  dpoNotes: string | null;
  legalHold: Record<string, unknown> | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  completedAt: string | null;
  resultSummary: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrivacyRequestBody {
  type: PrivacyRequestType;
  subjectType?: PrivacySubjectType;
  subjectId?: string;
  userMessage?: string;
}

export interface ReviewPrivacyRequestBody {
  status: PrivacyRequestStatus;
  dpoNotes?: string;
}

export interface BusinessDataExportDto {
  exportedAt: string;
  exportedBy: string;
  tenantId: string;
  subjectType: 'USER' | 'CLIENT';
  subjectId: string;
  data: Record<string, unknown>;
  legalRetentionNote: string;
}
