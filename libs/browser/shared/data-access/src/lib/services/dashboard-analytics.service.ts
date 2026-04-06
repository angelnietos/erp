import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

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
}

/** KPIs desde backend con caché en caliente (shareReplay). */
@Injectable({ providedIn: 'root' })
export class DashboardAnalyticsService {
  private readonly http = inject(HttpClient);
  private stream$: Observable<DashboardSummaryDto | null> | null = null;

  getSummary(): Observable<DashboardSummaryDto | null> {
    if (!this.stream$) {
      this.stream$ = this.http
        .get<DashboardSummaryDto>('/api/analytics/dashboard-summary')
        .pipe(
          catchError(() => of(null)),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.stream$;
  }

  invalidateCache(): void {
    this.stream$ = null;
  }
}
