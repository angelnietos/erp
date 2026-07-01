import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, tap, map } from 'rxjs';
import { Client, ClientService } from '../services/client.service';

@Injectable({ providedIn: 'root' })
export class ClientsFacade {
  private readonly clientService = inject(ClientService);

  private readonly _clients = signal<Client[]>([]);
  /** Detalle completo por id (p. ej. tras GET /clients/:id). */
  private readonly _clientDetailsById = signal<Record<string, Client>>({});
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _hasCache = signal(false);

  readonly clients = this._clients.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hasCache = this._hasCache.asReadonly();

  /** Carga inicial: usa caché en memoria si ya se obtuvo la lista. */
  loadClients(): void {
    if (this._hasCache()) {
      return;
    }
    this.fetchClients({ background: false });
  }

  /** Revalida en segundo plano manteniendo la lista visible si hay caché. */
  refreshClients(): void {
    if (this._isLoading()) {
      return;
    }
    this.fetchClients({ background: this._hasCache() });
  }

  private fetchClients(options: { background: boolean }): void {
    if (!options.background) {
      this._isLoading.set(true);
    }
    this._error.set(null);

    this.clientService.getClients().subscribe({
      next: (data) => {
        this._clients.set(data);
        this._hasCache.set(true);
        this._isLoading.set(false);
      },
      error: (err: { message?: string }) => {
        this._error.set(err.message || 'No se pudieron cargar los clientes.');
        this._isLoading.set(false);
      },
    });
  }

  searchClients(term: string): void {
    this._isLoading.set(true);
    this.clientService.searchClients(term).subscribe({
      next: (data) => {
        this._clients.set(data);
        this._hasCache.set(true);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error searching clients');
        this._isLoading.set(false);
      },
    });
  }

  createClient(client: Omit<Client, 'id' | 'createdAt'>): void {
    this._isLoading.set(true);
    this.clientService.createClient(client).subscribe({
      next: (newClient) => {
        this.upsertClient(newClient);
        this._isLoading.set(false);
      },
      error: (err: { message?: string }) => {
        this._error.set(err.message || 'No se pudo crear el cliente.');
        this._isLoading.set(false);
      },
    });
  }

  updateClient(id: string, updates: Partial<Client>): void {
    this.clientService.updateClient(id, updates).subscribe({
      next: (updatedClient) => {
        this.upsertClient(updatedClient);
      },
      error: (err: { message?: string }) => {
        this._error.set(err.message || 'No se pudo actualizar el cliente.');
      },
    });
  }

  /** Cliente en caché de lista o detalle (sin petición de red). */
  getClientFromCache(id: string): Client | undefined {
    return this._clientDetailsById()[id] ?? this._clients().find((c) => c.id === id);
  }

  /** Detalle ya obtenido por id (GET individual). */
  isClientDetailCached(id: string): boolean {
    return Boolean(this._clientDetailsById()[id]);
  }

  /**
   * Resuelve un cliente: usa caché de detalle; si solo está en lista, emite al instante
   * y revalida en segundo plano; si no hay caché, pide al API.
   */
  ensureClient(id: string): Observable<Client | null> {
    const detailCached = this._clientDetailsById()[id];
    if (detailCached) {
      return of(detailCached);
    }

    const listCached = this._clients().find((c) => c.id === id);
    if (listCached) {
      return new Observable<Client | null>((subscriber) => {
        subscriber.next(listCached);
        this.clientService.getClient(id).subscribe({
          next: (client) => {
            if (client) {
              this.upsertClient(client);
              subscriber.next(client);
            }
            subscriber.complete();
          },
          error: () => subscriber.complete(),
        });
      });
    }

    return this.clientService.getClient(id).pipe(
      tap((client) => {
        if (client) {
          this.upsertClient(client);
        }
      }),
      map((client) => client ?? null),
    );
  }

  upsertClient(client: Client): void {
    this._clients.update((clients) => {
      const index = clients.findIndex((entry) => entry.id === client.id);
      if (index === -1) {
        return [...clients, client];
      }
      const next = [...clients];
      next[index] = client;
      return next;
    });
    this._clientDetailsById.update((map) => ({ ...map, [client.id]: client }));
    this._hasCache.set(true);
  }

  removeClientFromCache(id: string): void {
    this._clients.update((clients) => clients.filter((c) => c.id !== id));
    this._clientDetailsById.update((map) => {
      const { [id]: _removed, ...rest } = map;
      return rest;
    });
    this._hasCache.set(true);
  }

  deleteClient(id: string): void {
    this._isLoading.set(true);
    this.deleteClient$(id).subscribe({
      next: () => {
        this._isLoading.set(false);
      },
      error: (err: { message?: string }) => {
        this._error.set(err.message || 'No se pudo eliminar el cliente.');
        this._isLoading.set(false);
      },
    });
  }

  deleteClient$(id: string): Observable<boolean> {
    return this.clientService.deleteClient(id).pipe(
      tap((success) => {
        if (success) {
          this.removeClientFromCache(id);
        }
      }),
    );
  }
}
