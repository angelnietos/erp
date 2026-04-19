import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/** Respuesta del backend (`GET /api/audit-logs`). */
export interface AuditLogApiDto {
  id: string;
  userName: string;
  action: string;
  entity: string;
  entityName?: string;
  timestamp: string;
  details?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  targetEntity: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogsApiService {
  private readonly http = inject(HttpClient);

  list(limit = 150): Observable<AuditLogApiDto[]> {
    return this.http.get<AuditLogApiDto[]>(`/api/audit-logs?limit=${limit}`);
  }
}
