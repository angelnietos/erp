import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { clientsPaths, type ClientRowDto } from '@generic-crm/clients-api';
import {
  API_BASE_URL,
  joinApiUrl,
} from '@generic-crm/shared-browser-data-access';
import type { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<ClientRowDto[]> {
    return this.http.get<ClientRowDto[]>(
      joinApiUrl(this.baseUrl, clientsPaths.collection),
    );
  }

  getById(id: string): Observable<ClientRowDto> {
    return this.http.get<ClientRowDto>(
      joinApiUrl(this.baseUrl, clientsPaths.one(id)),
    );
  }
}
