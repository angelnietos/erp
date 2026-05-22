import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateTimeOffRequestBody {
  kind: 'VACATION' | 'ABSENCE';
  startDate: string;
  endDate: string;
  notes?: string;
  technicianId?: string;
  absenceSubtype?: 'sick' | 'permit' | 'legal';
}

export interface TimeOffRequestRow {
  id: string;
  tenantId: string;
  technicianId: string;
  requesterUserId: string;
  kind: string;
  absenceSubtype: string | null;
  startDate: string;
  endDate: string;
  notes: string | null;
  status: string;
  decidedAt: string | null;
  decidedByUserId: string | null;
  createdAt: string;
  technician?: {
    user?: { firstName?: string; lastName?: string; email?: string };
  };
  requester?: { email?: string; firstName?: string; lastName?: string };
}

@Injectable({ providedIn: 'root' })
export class TimeOffApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/time-off-requests';

  create(body: CreateTimeOffRequestBody): Observable<TimeOffRequestRow> {
    return this.http.post<TimeOffRequestRow>(this.baseUrl, body);
  }

  getMine(): Observable<TimeOffRequestRow[]> {
    return this.http.get<TimeOffRequestRow[]>(`${this.baseUrl}/mine`);
  }

  getPending(): Observable<TimeOffRequestRow[]> {
    return this.http.get<TimeOffRequestRow[]>(`${this.baseUrl}/pending`);
  }

  approve(id: string): Observable<TimeOffRequestRow> {
    return this.http.post<TimeOffRequestRow>(`${this.baseUrl}/${id}/approve`, {});
  }

  reject(id: string): Observable<TimeOffRequestRow> {
    return this.http.post<TimeOffRequestRow>(`${this.baseUrl}/${id}/reject`, {});
  }
}
