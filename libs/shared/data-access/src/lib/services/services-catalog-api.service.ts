import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

export interface ServiceCatalogItemDto {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
}

/** Catálogo de servicios desde backend (caché en caliente). */
@Injectable({ providedIn: 'root' })
export class ServicesCatalogApiService {
  private readonly http = inject(HttpClient);
  private stream$: Observable<ServiceCatalogItemDto[]> | null = null;

  list(): Observable<ServiceCatalogItemDto[]> {
    if (!this.stream$) {
      this.stream$ = this.http
        .get<ServiceCatalogItemDto[]>('/api/services')
        .pipe(
          catchError(() => of([])),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.stream$;
  }

  invalidateCache(): void {
    this.stream$ = null;
  }
}
