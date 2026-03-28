import { Injectable, inject, signal } from '@angular/core';
import { Client, ClientService } from '../services/client.service';

@Injectable({ providedIn: 'root' })
export class ClientsFacade {
  private readonly clientService = inject(ClientService);

  // State
  private readonly _clients = signal<Client[]>([]);
  private readonly _selectedClient = signal<Client | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Selectors
  readonly clients = this._clients.asReadonly();
  readonly selectedClient = this._selectedClient.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Actions
  loadClients(): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.clientService.getClients().subscribe({
      next: (data) => {
        this._clients.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error loading clients');
        this._isLoading.set(false);
      }
    });
  }

  searchClients(term: string): void {
    this._isLoading.set(true);
    this.clientService.searchClients(term).subscribe({
      next: (data) => {
        this._clients.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error searching clients');
        this._isLoading.set(false);
      }
    });
  }

  createClient(client: Omit<Client, 'id' | 'createdAt'>): void {
    this._isLoading.set(true);
    this.clientService.createClient(client).subscribe({
      next: (newClient) => {
        this._clients.update(clients => [...clients, newClient]);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error creating client');
        this._isLoading.set(false);
      }
    });
  }

  updateClient(id: string, updates: Partial<Client>): void {
    this._isLoading.set(true);
    this.clientService.updateClient(id, updates).subscribe({
      next: (updatedClient) => {
        this._clients.update(clients => 
          clients.map(c => c.id === id ? updatedClient : c)
        );
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error updating client');
        this._isLoading.set(false);
      }
    });
  }

  deleteClient(id: string): void {
    this._isLoading.set(true);
    this.clientService.deleteClient(id).subscribe({
      next: (success) => {
        if (success) {
          this._clients.update(clients => clients.filter(c => c.id !== id));
        }
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error deleting client');
        this._isLoading.set(false);
      }
    });
  }
}
