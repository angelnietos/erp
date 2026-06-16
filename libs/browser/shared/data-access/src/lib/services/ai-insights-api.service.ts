import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type AiInsightEventType =
  | 'workflow'
  | 'chat'
  | 'feedback'
  | 'delegation'
  | 'prediction'
  | 'system';

export interface CreateAiInsightPayload {
  botId: string;
  feature: string;
  title: string;
  summary: string;
  metrics?: Record<string, string | number>;
  metadata?: Record<string, string | number | boolean>;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  eventType?: AiInsightEventType;
}

export interface AiInsightDto {
  id: string;
  tenantId: string;
  userId?: string | null;
  userEmail?: string | null;
  sessionId?: string | null;
  eventType: string;
  botId: string;
  feature: string;
  title: string;
  summary: string;
  priority: string;
  status: string;
  metrics?: Record<string, string | number> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiInsightsSummaryDto {
  total: number;
  today: number;
  last7Days: number;
  activeUsers: number;
  lastInsightAt: string | null;
  byEventType: Record<string, number>;
  byFeature: Record<string, number>;
  byBot: Record<string, number>;
}

export interface AiTrainingRowDto {
  id: string;
  createdAt: string;
  userId: string | null;
  userEmail: string | null;
  sessionId: string | null;
  eventType: string;
  feature: string;
  botId: string;
  title: string;
  summary: string;
  priority: string;
  metrics: Record<string, unknown>;
  metadata: Record<string, unknown>;
  label: string | null;
}

export interface AiTrainingDatasetDto {
  generatedAt: string;
  tenantId: string;
  total: number;
  rows: AiTrainingRowDto[];
}

export interface AiInsightUserActivityDto {
  userId: string;
  userEmail: string;
  count: number;
  lastActivityAt: string | null;
}

export interface AiInsightListFilters {
  userId?: string;
  feature?: string;
  botId?: string;
  eventType?: string;
  limit?: number;
}

const INSIGHTS_BC = 'josanz-ai-insights';

/** Registra y consulta eventos de IA (módulo AI Insights + dataset de entrenamiento). */
@Injectable({ providedIn: 'root' })
export class AiInsightsApiService {
  private readonly http = inject(HttpClient);

  record(payload: CreateAiInsightPayload): Observable<AiInsightDto | null> {
    return this.http.post<AiInsightDto>('/api/ai-insights', payload).pipe(
      tap(() => this.broadcastRecorded()),
      catchError((err) => {
        console.warn('[AiInsightsApi] No se pudo registrar insight:', err);
        return of(null);
      }),
    );
  }

  list(filters: AiInsightListFilters = {}): Observable<AiInsightDto[]> {
    let params = new HttpParams();
    if (filters.userId) params = params.set('userId', filters.userId);
    if (filters.feature) params = params.set('feature', filters.feature);
    if (filters.botId) params = params.set('botId', filters.botId);
    if (filters.eventType) params = params.set('eventType', filters.eventType);
    if (filters.limit) params = params.set('limit', String(filters.limit));
    return this.http.get<AiInsightDto[]>('/api/ai-insights', { params }).pipe(
      catchError(() => of([])),
    );
  }

  getSummary(): Observable<AiInsightsSummaryDto | null> {
    return this.http
      .get<AiInsightsSummaryDto>('/api/ai-insights/summary')
      .pipe(catchError(() => of(null)));
  }

  getTrainingDataset(opts?: {
    limit?: number;
    userId?: string;
    eventType?: string;
  }): Observable<AiTrainingDatasetDto | null> {
    let params = new HttpParams();
    if (opts?.limit) params = params.set('limit', String(opts.limit));
    if (opts?.userId) params = params.set('userId', opts.userId);
    if (opts?.eventType) params = params.set('eventType', opts.eventType);
    return this.http
      .get<AiTrainingDatasetDto>('/api/ai-insights/training-dataset', { params })
      .pipe(catchError(() => of(null)));
  }

  getUserActivity(): Observable<AiInsightUserActivityDto[]> {
    return this.http
      .get<AiInsightUserActivityDto[]>('/api/ai-insights/users')
      .pipe(catchError(() => of([])));
  }

  /** Suscripción a eventos de otras pestañas (p. ej. tras un workflow en Buddy). */
  subscribeToLiveUpdates(onEvent: () => void): () => void {
    if (typeof BroadcastChannel === 'undefined') {
      return () => undefined;
    }
    const bc = new BroadcastChannel(INSIGHTS_BC);
    bc.onmessage = () => onEvent();
    return () => bc.close();
  }

  private broadcastRecorded(): void {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel(INSIGHTS_BC).postMessage({
          type: 'insight-recorded',
          at: Date.now(),
        });
      }
    } catch {
      /* ignore */
    }
  }
}
