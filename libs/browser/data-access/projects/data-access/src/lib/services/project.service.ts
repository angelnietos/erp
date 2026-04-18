import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  clientId?: string;
  clientName?: string;
  createdAt: string;
  notes?: string;
  tenantId?: string;
}

/** Respuesta GET lista (backend `getProjectsList`). */
interface ProjectListRow {
  id: string;
  name: string;
  description?: string | null;
  status: Project['status'];
  startDate?: string | null;
  endDate?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  createdAt: string;
}

/** Respuesta GET `:id` y PATCH (fragmentos). */
interface ProjectDetailRow {
  id: string;
  tenantId?: string;
  name: string;
  description?: string | null;
  status: Project['status'];
  startDate?: string | null;
  endDate?: string | null;
  clientId?: string | null;
  createdAt: string;
}

function httpErrorMessage(err: HttpErrorResponse): string {
  const body = err.error as { message?: string | string[] } | undefined;
  if (body && typeof body.message === 'string') {
    return body.message;
  }
  if (Array.isArray(body?.message)) {
    return body.message.join(', ');
  }
  return err.message || 'Error de red';
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(GlobalAuthStore);
  /** Relativa; el interceptor antepone origen API en desarrollo. */
  private readonly baseUrl = '/api/projects';

  private tenantIdOrThrow(): string {
    const tid = this.auth.user()?.tenantId;
    if (!tid?.trim()) {
      throw new Error('No hay tenant en sesión.');
    }
    return tid;
  }

  private mapListRow(p: ProjectListRow): Project {
    return {
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      status: p.status,
      startDate: p.startDate ?? undefined,
      endDate: p.endDate ?? undefined,
      clientId: p.clientId ?? undefined,
      clientName: p.clientName ?? undefined,
      createdAt: p.createdAt,
    };
  }

  private mapDetailRow(p: ProjectDetailRow): Project {
    return {
      id: p.id,
      tenantId: p.tenantId,
      name: p.name,
      description: p.description ?? undefined,
      status: p.status,
      startDate: p.startDate ?? undefined,
      endDate: p.endDate ?? undefined,
      clientId: p.clientId ?? undefined,
      createdAt: p.createdAt.includes('T') ? p.createdAt.split('T')[0] : p.createdAt,
    };
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<ProjectListRow[]>(this.baseUrl).pipe(
      map((rows) => rows.map((r) => this.mapListRow(r))),
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err))),
      ),
    );
  }

  getProject(id: string): Observable<Project | undefined> {
    return this.http.get<ProjectDetailRow | null>(`${this.baseUrl}/${id}`).pipe(
      map((p) => (p ? this.mapDetailRow(p) : undefined)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(undefined);
        }
        return throwError(() => new Error(httpErrorMessage(err)));
      }),
    );
  }

  createProject(project: Omit<Project, 'id' | 'createdAt'>): Observable<Project> {
    const tenantId = this.tenantIdOrThrow();
    const body = {
      tenantId,
      name: project.name,
      description: project.description,
      startDate: project.startDate || undefined,
      endDate: project.endDate || undefined,
      clientId:
        project.clientId && project.clientId.trim() !== '' ? project.clientId : undefined,
    };
    return this.http.post<{ id: string }>(this.baseUrl, body).pipe(
      switchMap((r) =>
        this.getProject(r.id).pipe(
          map((full) => {
            if (!full) {
              throw new Error('Proyecto creado pero no se pudo cargar la ficha.');
            }
            return full;
          }),
        ),
      ),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          return throwError(() => new Error(httpErrorMessage(err)));
        }
        if (err instanceof Error) {
          return throwError(() => err);
        }
        return throwError(() => new Error(String(err)));
      }),
    );
  }

  updateProject(id: string, updates: Partial<Project>): Observable<Project> {
    return this.getProject(id).pipe(
      switchMap((current) => {
        if (!current) {
          return throwError(() => new Error('Proyecto no encontrado.'));
        }
        const dto: Record<string, string | undefined> = {};
        if (updates.name !== undefined) {
          dto['name'] = updates.name;
        }
        if (updates.description !== undefined) {
          dto['description'] = updates.description;
        }
        if (updates.startDate !== undefined) {
          dto['startDate'] = updates.startDate || undefined;
        }
        if (updates.endDate !== undefined) {
          dto['endDate'] = updates.endDate || undefined;
        }
        if (updates.clientId !== undefined) {
          dto['clientId'] =
            updates.clientId && updates.clientId.trim() !== '' ? updates.clientId : undefined;
        }
        return this.http.patch<ProjectDetailRow>(`${this.baseUrl}/${id}`, dto).pipe(
          switchMap(() =>
            this.applyStatusTransitionIfNeeded(id, current.status, updates.status),
          ),
          switchMap(() =>
            this.getProject(id).pipe(
              map((p) => {
                if (!p) {
                  throw new Error('No se pudo recargar el proyecto.');
                }
                return p;
              }),
            ),
          ),
          catchError((err: HttpErrorResponse) =>
            throwError(() => new Error(httpErrorMessage(err))),
          ),
        );
      }),
    );
  }

  /** Transiciones de estado expuestas como rutas dedicadas en el API. */
  private applyStatusTransitionIfNeeded(
    id: string,
    previous: Project['status'],
    next?: Project['status'],
  ): Observable<void> {
    if (next === undefined || next === previous) {
      return of(undefined);
    }
    if (previous === 'ACTIVE' && next === 'COMPLETED') {
      return this.http.patch(`${this.baseUrl}/${id}/complete`, {}).pipe(map(() => undefined));
    }
    if (previous === 'ACTIVE' && next === 'CANCELLED') {
      return this.http.patch(`${this.baseUrl}/${id}/cancel`, {}).pipe(map(() => undefined));
    }
    if (previous === 'CANCELLED' && next === 'ACTIVE') {
      return throwError(
        () =>
          new Error(
            'Reactivar un proyecto cancelado no está disponible en la API actual.',
          ),
      );
    }
    if (previous === 'COMPLETED' && next !== 'COMPLETED') {
      return throwError(
        () => new Error('No se puede cambiar el estado de un proyecto completado.'),
      );
    }
    return of(undefined);
  }

  deleteProject(id: string): Observable<boolean> {
    return this.http.delete<{ success?: boolean }>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err))),
      ),
    );
  }

  searchProjects(term: string): Observable<Project[]> {
    const q = term.trim().toLowerCase();
    if (!q) {
      return this.getProjects();
    }
    return this.getProjects().pipe(
      map((projects) =>
        projects.filter(
          (project) =>
            project.name.toLowerCase().includes(q) ||
            project.description?.toLowerCase().includes(q) ||
            project.clientName?.toLowerCase().includes(q),
        ),
      ),
    );
  }
}
