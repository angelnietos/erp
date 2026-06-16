import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CreateAiInsightPayload {
  botId: string;
  feature: string;
  title: string;
  summary: string;
  metrics?: Record<string, string | number>;
  metadata?: Record<string, string | number>;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

/** Registra eventos de IA en el backend (módulo AI Insights). */
@Injectable({ providedIn: 'root' })
export class AiInsightsApiService {
  private readonly http = inject(HttpClient);

  record(payload: CreateAiInsightPayload): Observable<unknown> {
    return this.http.post('/api/ai-insights', payload).pipe(
      catchError((err) => {
        console.warn('[AiInsightsApi] No se pudo registrar insight:', err);
        return of(null);
      }),
    );
  }
}
