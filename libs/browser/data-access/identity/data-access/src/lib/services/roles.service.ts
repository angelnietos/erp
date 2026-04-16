import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private readonly apiUrl = '/api/roles';

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  findById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  create(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  update(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
