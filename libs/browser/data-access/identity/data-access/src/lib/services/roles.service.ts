import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';
import { catchHttpDetailNotFound } from '@josanz-erp/shared-data-access';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private readonly apiUrl = '/api/roles';
  private readonly http = inject(HttpClient);

  findAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  /** Lista estática de permisos (id, label, group) para matrices / overrides por usuario. */
  getPermissionsCatalog(): Observable<{ id: string; label: string; group: string }[]> {
    return this.http.get<{ id: string; label: string; group: string }[]>(
      `${this.apiUrl}/permissions`,
    );
  }

  findById(id: string): Observable<Role | undefined> {
    return this.http
      .get<Role>(`${this.apiUrl}/${id}`)
      .pipe(catchHttpDetailNotFound<Role>());
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
