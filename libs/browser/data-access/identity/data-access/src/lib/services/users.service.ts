import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateUserDto, UpdateUserDto, User } from '@josanz-erp/identity-api';
import { catchHttpDetailNotFound } from '@josanz-erp/shared-data-access';

/** Normaliza la respuesta del API (camelCase / snake_case, roles como string u objeto). */
export function mapApiUserPayload(raw: unknown): User {
  const r = raw as Record<string, unknown>;
  const id = String(r['id'] ?? '');
  const email = String(r['email'] ?? '');
  const firstName = (r['firstName'] ?? r['first_name']) as string | undefined;
  const lastName = (r['lastName'] ?? r['last_name']) as string | undefined;
  const isActive = r['isActive'] ?? r['is_active'];
  const category = (r['category'] as string | undefined) ?? undefined;
  const createdAt = String(r['createdAt'] ?? r['created_at'] ?? '');
  const updatedRaw = r['updatedAt'] ?? r['updated_at'];

  let roles: string[] = [];
  const rawRoles = r['roles'];
  if (Array.isArray(rawRoles)) {
    roles = rawRoles.map((item) => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object' && 'name' in (item as object)) {
        return String((item as { name: string }).name);
      }
      return String(item);
    });
  }
  const rawPerms = r['permissions'];
  const permissions = Array.isArray(rawPerms)
    ? rawPerms.filter((p): p is string => typeof p === 'string')
    : [];
  const rawExtra = r['extraPermissions'] ?? r['extra_permissions'];
  const extraPermissions = Array.isArray(rawExtra)
    ? rawExtra.filter((p): p is string => typeof p === 'string')
    : [];

  return {
    id,
    email,
    firstName,
    lastName,
    isActive: isActive !== false && isActive !== 'false',
    roles,
    permissions,
    extraPermissions,
    category,
    createdAt,
    updatedAt: updatedRaw ? String(updatedRaw) : undefined,
  };
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiUrl = '/api/users';
  private readonly http = inject(HttpClient);

  findAll(): Observable<User[]> {
    return this.http
      .get<unknown[]>(this.apiUrl)
      .pipe(map((list) => list.map(mapApiUserPayload)));
  }

  findById(id: string): Observable<User | undefined> {
    return this.http
      .get<unknown>(`${this.apiUrl}/${id}`)
      .pipe(
        map(mapApiUserPayload),
        catchHttpDetailNotFound<User>(),
      );
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http
      .post<unknown>(this.apiUrl, dto)
      .pipe(map(mapApiUserPayload));
  }

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http
      .put<unknown>(`${this.apiUrl}/${id}`, dto)
      .pipe(map(mapApiUserPayload));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
