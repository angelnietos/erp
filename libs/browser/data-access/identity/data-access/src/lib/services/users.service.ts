import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateUserDto, UpdateUserDto, User } from '@josanz-erp/identity-api';

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

  return {
    id,
    email,
    firstName,
    lastName,
    isActive: isActive !== false && isActive !== 'false',
    roles,
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

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<User[]> {
    return this.http
      .get<unknown[]>(this.apiUrl)
      .pipe(map((list) => list.map(mapApiUserPayload)));
  }

  findById(id: string): Observable<User> {
    return this.http
      .get<unknown>(`${this.apiUrl}/${id}`)
      .pipe(map(mapApiUserPayload));
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
