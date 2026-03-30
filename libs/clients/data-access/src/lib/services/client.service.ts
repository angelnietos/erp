import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getClient(id: string): Observable<Client | undefined> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  createClient(client: Omit<Client, 'id'>): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  updateClient(id: string, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  deleteClient(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  searchClients(term: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`);
  }
}
