import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { httpErrorMessage } from '@josanz-erp/shared-data-access';

export interface Service {
  id: string;
  name: string;
  description?: string;
  type:
    | 'STREAMING'
    | 'PRODUCCIÓN'
    | 'LED'
    | 'TRANSPORTE'
    | 'PERSONAL_TÉCNICO'
    | 'VIDEO_TÉCNICO';
  basePrice: number;
  hourlyRate?: number;
  isActive: boolean;
  createdAt: string;
}

/** Respuesta de GET /api/services (alineada con el backend). */
interface ServicesApiRow {
  id: string;
  name: string;
  description?: string;
  type: string;
  basePrice: number;
  hourlyRate?: number;
  isActive: boolean;
  createdAt: string;
}

const KNOWN_TYPES = new Set<Service['type']>([
  'STREAMING',
  'PRODUCCIÓN',
  'LED',
  'TRANSPORTE',
  'PERSONAL_TÉCNICO',
  'VIDEO_TÉCNICO',
]);

function mapRowToService(row: ServicesApiRow): Service {
  const t = row.type as Service['type'];
  const type = KNOWN_TYPES.has(t) ? t : 'STREAMING';
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type,
    basePrice: row.basePrice,
    hourlyRate: row.hourlyRate,
    isActive: row.isActive,
    createdAt: row.createdAt,
  };
}

/**
 * ServicesStore — estado del catálogo (lista cargada desde GET /api/services).
 * Las mutaciones locales (add/update/remove/duplicate) siguen siendo optimistas hasta conectar CRUD HTTP.
 */
@Injectable({ providedIn: 'root' })
export class ServicesStore {
  private readonly http = inject(HttpClient);
  private readonly _services = signal<Service[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private _loaded = false;

  readonly services = this._services.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeCount = computed(
    () => this._services().filter((s) => s.isActive).length,
  );
  readonly typesCount = computed(
    () => new Set(this._services().map((s) => s.type)).size,
  );

  /**
   * Carga el catálogo desde el backend. Con `force` se ignora la caché en memoria y se vuelve a pedir.
   */
  load(force = false): void {
    if (this._loaded && !force) return;
    this._error.set(null);
    this._isLoading.set(true);
    this.http
      .get<ServicesApiRow[]>('/api/services')
      .pipe(
        finalize(() => {
          this._isLoading.set(false);
        }),
      )
      .subscribe({
        next: (rows) => {
          this._services.set(rows.map(mapRowToService));
          this._loaded = true;
          this._error.set(null);
        },
        error: (err: HttpErrorResponse) => {
          this._error.set(httpErrorMessage(err));
          this._services.set([]);
          this._loaded = false;
        },
      });
  }

  getById(id: string): Service | undefined {
    return this._services().find((s) => s.id === id);
  }

  add(service: Service): void {
    this._services.update((list) => [service, ...list]);
  }

  update(id: string, changes: Partial<Service>): void {
    this._services.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    );
  }

  remove(id: string): void {
    this._services.update((list) => list.filter((s) => s.id !== id));
  }

  duplicate(id: string): void {
    const original = this.getById(id);
    if (!original) return;
    const copy: Service = {
      ...original,
      id: Math.random().toString(36).substring(7),
      name: `${original.name} (COPIA)`,
      createdAt: new Date().toISOString(),
    };
    this._services.update((list) => [copy, ...list]);
  }
}
