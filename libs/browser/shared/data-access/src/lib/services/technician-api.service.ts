import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@josanz-erp/shared-data-access';
import { Observable } from 'rxjs';

export interface TechnicianAvailability {
  id: string;
  technicianId: string;
  date: string; // ISO format
  type: 'AVAILABLE' | 'UNAVAILABLE' | 'PARTIAL' | 'HOLIDAY' | 'SICK_LEAVE';
  notes?: string;
  startTime?: string;
  endTime?: string;
}

@Injectable({ providedIn: 'root' })
export class TechnicianApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiOrigin}/api/technicians`;

  getAvailability(technicianId: string, startDate?: string, endDate?: string): Observable<TechnicianAvailability[]> {
    return this.http.get<TechnicianAvailability[]>(`${this.baseUrl}/${technicianId}/availability`, {
      params: { startDate: startDate || '', endDate: endDate || '' }
    });
  }

  updateAvailability(technicianId: string, item: Partial<TechnicianAvailability>): Observable<TechnicianAvailability> {
    return this.http.put<TechnicianAvailability>(`${this.baseUrl}/${technicianId}/availability`, item);
  }

  setFullDayAvailability(technicianId: string, date: string, type: string): Observable<TechnicianAvailability> {
    return this.http.post<TechnicianAvailability>(`${this.baseUrl}/${technicianId}/availability`, {
      date,
      type
    });
  }
}
