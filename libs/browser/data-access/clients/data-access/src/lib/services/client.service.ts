import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary: boolean;
}

export interface EventReport {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author?: { firstName: string, lastName: string, email: string };
  event?: { name: string, startDate: string };
}

export interface Budget {
  id: string;
  status: string;
  total: number;
  startDate: string;
  endDate: string;
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  issueDate: string;
  verifactuStatus: string;
}

export interface Client {
  id: string;
  name: string;
  taxId?: string;
  description: string;
  sector: string;
  contact: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  type?: string;
  contacts?: ClientContact[];
  eventReports?: EventReport[];
  budgets?: Budget[];
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
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
