import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

export interface TechnicianUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Technician {
  id: string;
  tenantId: string;
  skills: string[];
  status: string;
  hourlyRate: number;
  user: TechnicianUser;
  availability: TechnicianAvailability[];
}

export interface BulkAvailabilitySlot {
  date: string;
  type: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class TechnicianApiService {
  private readonly http = inject(HttpClient);
  /** Relativa; el interceptor de origen antepone `apiOrigin` en desarrollo. */
  private readonly baseUrl = '/api/technicians';

  /** Obtiene la lista de todos los técnicos del tenant */
  getTechnicians(): Observable<Technician[]> {
    return this.http.get<Technician[]>(this.baseUrl);
  }

  /** Obtiene la disponibilidad de un técnico en un rango de fechas */
  getAvailability(technicianId: string, startDate?: string, endDate?: string): Observable<TechnicianAvailability[]> {
    return this.http.get<TechnicianAvailability[]>(`${this.baseUrl}/${technicianId}/availability`, {
      params: { startDate: startDate || '', endDate: endDate || '' }
    });
  }

  /** Actualiza disponibilidad (PUT legacy) */
  updateAvailability(technicianId: string, item: Partial<TechnicianAvailability>): Observable<TechnicianAvailability> {
    return this.http.put<TechnicianAvailability>(`${this.baseUrl}/${technicianId}/availability`, item);
  }

  /** Guarda disponibilidad de un día concreto */
  setFullDayAvailability(technicianId: string, date: string, type: string, notes?: string): Observable<TechnicianAvailability> {
    return this.http.post<TechnicianAvailability>(`${this.baseUrl}/${technicianId}/availability`, {
      date,
      type,
      notes
    });
  }

  /** Guarda disponibilidad en bloque (usado por el bot) */
  setBulkAvailability(technicianId: string, slots: BulkAvailabilitySlot[]): Observable<{ saved: number; items: TechnicianAvailability[] }> {
    return this.http.post<{ saved: number; items: TechnicianAvailability[] }>(
      `${this.baseUrl}/${technicianId}/availability/bulk`,
      { slots }
    );
  }

  /** Planificación automática mensual completa (para el bot) */
  autoPlanMonth(technicianId: string, year: number, month: number): Observable<{ saved: number; items: TechnicianAvailability[] }> {
    return this.http.post<{ saved: number; items: TechnicianAvailability[] }>(
      `${this.baseUrl}/${technicianId}/availability/auto-plan`,
      { year, month }
    );
  }
}
