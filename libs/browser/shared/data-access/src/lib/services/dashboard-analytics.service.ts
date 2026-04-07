import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DashboardSummaryDto {
  generatedAt: string;
  tenantId: string;
  metrics: {
    totalRevenue: number;
    activeProjects: number;
    totalClients: number;
    completedEvents: number;
  };
  trends: {
    revenueChangePercent: number;
    projectsDelta: number;
    clientsDelta: number;
    eventsNote: string;
  };
  charts: {
    revenueByClient: { clientId: string; name: string; revenue: number }[];
    revenueByProject: { projectId: string; name: string; revenue: number }[];
  };
}

/** KPIs desde backend (sin caché HTTP: apto para refresco periódico en dashboard). */
@Injectable({ providedIn: 'root' })
export class DashboardAnalyticsService {
  private readonly http = inject(HttpClient);

  getSummary(): Observable<DashboardSummaryDto | null> {
    return this.http
      .get<DashboardSummaryDto>('/api/analytics/dashboard-summary')
      .pipe(catchError(() => of(null)));
  }
}
