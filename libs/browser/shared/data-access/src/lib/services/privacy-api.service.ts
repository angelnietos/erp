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

export interface PrivacySecurityStatusDto {
  encryptionAtRest: boolean;
  piiRedactionEnabled: boolean;
  auditInterceptorEnabled: boolean;
  auditRetentionDays: number;
  domainEventsRetentionDays: number;
  policyVersion: string;
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

  exportMyData(): Observable<UserDataExportDto> {
    return this.http.get<UserDataExportDto>('/api/privacy/export/me');
  }

  anonymizeMyTelemetry(): Observable<PrivacyErasureResult> {
    return this.http.post<PrivacyErasureResult>('/api/privacy/erasure/me', {});
  }
}
