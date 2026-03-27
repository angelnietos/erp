import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/clients';

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }
}
