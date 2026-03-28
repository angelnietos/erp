import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Client {
  id: string;
  name: string;
  description: string;
  sector: string;
  contact: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = '/api/clients';

  // Mock data for development
  private mockClients: Client[] = [
    {
      id: '1',
      name: 'Producciones Audiovisuales Madrid',
      description: 'Empresa de producción audiovisual',
      sector: 'Producción',
      contact: 'Juan García',
      email: 'juan@produccionesmadrid.es',
      phone: '+34 612 345 678',
      address: 'Calle Gran Vía 25, Madrid',
      createdAt: '2026-01-15',
    },
    {
      id: '2',
      name: 'Cadena TV España',
      description: 'Televisión nacional',
      sector: 'Medios',
      contact: 'María López',
      email: 'maria@tvspain.es',
      phone: '+34 611 234 567',
      address: 'Avenida Diagonal 100, Barcelona',
      createdAt: '2026-02-01',
    },
    {
      id: '3',
      name: 'Film Studios Barcelona',
      description: 'Estudios cinematográficos',
      sector: 'Cine',
      contact: 'Carlos Rodríguez',
      email: 'carlos@filmstudios.es',
      phone: '+34 610 987 654',
      address: 'Polígono Industrial, Barcelona',
      createdAt: '2026-02-10',
    },
  ];

  getClients(): Observable<Client[]> {
    // Use mock data with delay to simulate API
    return of(this.mockClients).pipe(delay(300));
  }

  getClient(id: string): Observable<Client | undefined> {
    return of(this.mockClients.find(c => c.id === id)).pipe(delay(200));
  }

  createClient(client: Omit<Client, 'id' | 'createdAt'>): Observable<Client> {
    const newClient: Client = {
      ...client,
      id: this.generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.mockClients = [...this.mockClients, newClient];
    return of(newClient).pipe(delay(300));
  }

  updateClient(id: string, client: Partial<Client>): Observable<Client> {
    const index = this.mockClients.findIndex(c => c.id === id);
    if (index >= 0) {
      this.mockClients[index] = {
        ...this.mockClients[index],
        ...client,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return of(this.mockClients[index]).pipe(delay(300));
    }
    throw new Error('Client not found');
  }

  deleteClient(id: string): Observable<boolean> {
    const index = this.mockClients.findIndex(c => c.id === id);
    if (index >= 0) {
      this.mockClients = this.mockClients.filter(c => c.id !== id);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  searchClients(term: string): Observable<Client[]> {
    const searchTerm = term.toLowerCase();
    const results = this.mockClients.filter(c =>
      c.name.toLowerCase().includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm) ||
      c.sector.toLowerCase().includes(searchTerm) ||
      c.contact.toLowerCase().includes(searchTerm)
    );
    return of(results).pipe(delay(200));
  }

  private generateId(): string {
    return 'cli-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}
