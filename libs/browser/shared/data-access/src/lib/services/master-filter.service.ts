import { Injectable, signal } from '@angular/core';
import {
  FilterableService,
  MasterFilterResultItem,
} from '../tokens/filter.tokens';
import { of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  finalize,
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Service central para gestionar el estado de filtrado en toda la aplicación.
 * Inyecta opcionalmente el 'FILTER_PROVIDER' que esté disponible en el injector actual
 * de la vista / shell hija.
 */
@Injectable({ providedIn: 'root' })
export class MasterFilterService {
  private activeProvider = signal<FilterableService<MasterFilterResultItem> | null>(
    null,
  );

  private readonly querySubject = new Subject<string>();

  // Señales reactivas para el estado UI
  readonly results = signal<MasterFilterResultItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly query = signal<string>('');

  constructor() {
    this.querySubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        tap((q) => {
          this.query.set(q);
          if (!this.activeProvider() || !q.trim()) {
            this.results.set([]);
            return;
          }
          this.loading.set(true);
        }),
        switchMap((q) => {
          const provider = this.activeProvider();
          if (!provider || !q.trim()) return of([] as MasterFilterResultItem[]);
          return provider
            .filter(q)
            .pipe(finalize(() => this.loading.set(false)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.results.set(res);
      });
  }

  /**
   * Registra el proveedor de filtrado para el contexto actual.
   */
  registerProvider(provider: FilterableService<MasterFilterResultItem>) {
    this.activeProvider.set(provider);
  }

  applyAIPendingFilter(query: string) {
    if (query) {
      this.search(query);
    }
  }

  /**
   * Desregistra el proveedor actual.
   */
  unregisterProvider() {
    this.activeProvider.set(null);
    this.clear();
  }

  search(query: string) {
    this.querySubject.next(query);
  }

  clear() {
    this.query.set('');
    this.results.set([]);
    this.loading.set(false);
  }

  hasProvider(): boolean {
    return !!this.activeProvider();
  }
}
