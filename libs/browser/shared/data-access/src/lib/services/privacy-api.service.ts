import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PrivacyPolicyDto {
  version: string;
  lawfulBasis: string[];
  retentionDays: Record<string, number>;
  dataCategories: string[];
  rights: string[];
  contactDpo: string;
}

export interface UserDataExportDto {
  exportedAt: string;
  userId: string;
  tenantId: string;
  profile: Record<string, unknown> | null;
  auditActivity: unknown[];
  aiTelemetry: unknown[];
  note: string;
}

export interface PrivacyErasureResult {
  ok: true;
  anonymizedInsights: number;
}

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

export interface PrivacyRequestDto {
  id: string;
  tenantId: string;
  requesterUserId: string;
  type: PrivacyRequestType;
  status: PrivacyRequestStatus;
  subjectType: string | null;
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

export interface BusinessDataExportDto {
  exportedAt: string;
  exportedBy: string;
  tenantId: string;
  subjectType: 'USER' | 'CLIENT';
  subjectId: string;
  data: Record<string, unknown>;
  legalRetentionNote: string;
}

export interface PrivacySecurityStatusDto {
  encryptionAtRest: boolean;
  piiRedactionEnabled: boolean;
  auditInterceptorEnabled: boolean;
  auditRetentionDays: number;
  domainEventsRetentionDays: number;
  policyVersion: string;
}

export interface RopaDocumentDto {
  version: string;
  updatedAt: string;
  dpoContact: string;
  treatments: {
    id: string;
    name: string;
    purpose: string;
    dataCategories: string[];
    lawfulBasis: string;
    retentionDays: number | null;
    technicalMeasures: string[];
  }[];
  dataSubjectRights: { right: string; implementation: string }[];
  markdownPath: string;
}

export interface DpiaDocumentDto {
  version: string;
  updatedAt: string;
  conclusion: string;
  acceptable: boolean;
  risks: {
    id: string;
    description: string;
    probability: string;
    impact: string;
    level: string;
    mitigation: string;
    status: string;
  }[];
  actionPlan: { action: string; priority: string; deadline: string; status: string }[];
  markdownPath: string;
}

@Injectable({ providedIn: 'root' })
export class PrivacyApiService {
  private readonly http = inject(HttpClient);

  getPolicy(): Observable<PrivacyPolicyDto> {
    return this.http.get<PrivacyPolicyDto>('/api/privacy/policy');
  }

  getSecurityStatus(): Observable<PrivacySecurityStatusDto> {
    return this.http.get<PrivacySecurityStatusDto>('/api/privacy/status');
  }

  getRopa(): Observable<RopaDocumentDto> {
    return this.http.get<RopaDocumentDto>('/api/privacy/ropa');
  }

  getDpia(): Observable<DpiaDocumentDto> {
    return this.http.get<DpiaDocumentDto>('/api/privacy/dpia');
  }

  exportMyData(): Observable<UserDataExportDto> {
    return this.http.get<UserDataExportDto>('/api/privacy/export/me');
  }

  anonymizeMyTelemetry(): Observable<PrivacyErasureResult> {
    return this.http.post<PrivacyErasureResult>('/api/privacy/erasure/me', {});
  }

  createRequest(body: {
    type: PrivacyRequestType;
    subjectType?: string;
    subjectId?: string;
    userMessage?: string;
  }): Observable<PrivacyRequestDto> {
    return this.http.post<PrivacyRequestDto>('/api/privacy/requests', body);
  }

  myRequests(): Observable<PrivacyRequestDto[]> {
    return this.http.get<PrivacyRequestDto[]>('/api/privacy/requests/me');
  }

  listDpoQueue(status?: PrivacyRequestStatus): Observable<PrivacyRequestDto[]> {
    const q = status ? `?status=${status}` : '';
    return this.http.get<PrivacyRequestDto[]>(`/api/privacy/requests${q}`);
  }

  reviewRequest(
    id: string,
    body: { status: PrivacyRequestStatus; dpoNotes?: string },
  ): Observable<PrivacyRequestDto> {
    return this.http.patch<PrivacyRequestDto>(`/api/privacy/requests/${id}`, body);
  }

  executeRequest(id: string): Observable<PrivacyRequestDto> {
    return this.http.post<PrivacyRequestDto>(`/api/privacy/requests/${id}/execute`, {});
  }

  exportUserAdmin(userId: string): Observable<BusinessDataExportDto> {
    return this.http.get<BusinessDataExportDto>(`/api/privacy/export/users/${userId}`);
  }

  exportClientAdmin(clientId: string): Observable<BusinessDataExportDto> {
    return this.http.get<BusinessDataExportDto>(`/api/privacy/export/clients/${clientId}`);
  }
}
