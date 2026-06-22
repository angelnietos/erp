import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

export type PlatformTenantRow = {
  id: string;
  name: string;
  slug: string;
  enabledModuleIds: string[];
  authMode?: 'keycloak' | 'local';
  keycloakRealm?: string;
  keycloakClientId?: string;
};

export type PlatformRoleRow = {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  permissions: string[];
  _count?: { users: number };
};

export type PlatformUserRow = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
};

export type PermissionOption = {
  id: string;
  label: string;
  group: string;
};

@Injectable({ providedIn: 'root' })
export class PlatformTenantApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiOrigin.replace(/\/$/, '');

  async listTenants(): Promise<PlatformTenantRow[]> {
    return firstValueFrom(
      this.http.get<PlatformTenantRow[]>(`${this.base}/api/platform/tenants`),
    );
  }

  async updateModules(tenantId: string, enabledModuleIds: string[]): Promise<void> {
    await firstValueFrom(
      this.http.put(`${this.base}/api/platform/tenants/${tenantId}/modules`, {
        enabledModuleIds,
      }),
    );
  }

  async listRoles(tenantId: string): Promise<PlatformRoleRow[]> {
    return firstValueFrom(
      this.http.get<PlatformRoleRow[]>(
        `${this.base}/api/platform/tenants/${tenantId}/roles`,
      ),
    );
  }

  async listPermissionOptions(tenantId: string): Promise<PermissionOption[]> {
    return firstValueFrom(
      this.http.get<PermissionOption[]>(
        `${this.base}/api/platform/tenants/${tenantId}/roles/permissions`,
      ),
    );
  }

  async createRole(
    tenantId: string,
    body: {
      name: string;
      description?: string;
      type: string;
      permissions: string[];
    },
  ): Promise<PlatformRoleRow> {
    return firstValueFrom(
      this.http.post<PlatformRoleRow>(
        `${this.base}/api/platform/tenants/${tenantId}/roles`,
        body,
      ),
    );
  }

  async updateRole(
    tenantId: string,
    roleId: string,
    body: { name?: string; description?: string; permissions?: string[] },
  ): Promise<PlatformRoleRow> {
    return firstValueFrom(
      this.http.put<PlatformRoleRow>(
        `${this.base}/api/platform/tenants/${tenantId}/roles/${roleId}`,
        body,
      ),
    );
  }

  async deleteRole(tenantId: string, roleId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `${this.base}/api/platform/tenants/${tenantId}/roles/${roleId}`,
      ),
    );
  }

  async listUsers(tenantId: string): Promise<PlatformUserRow[]> {
    return firstValueFrom(
      this.http.get<PlatformUserRow[]>(
        `${this.base}/api/platform/tenants/${tenantId}/users`,
      ),
    );
  }

  async createUser(
    tenantId: string,
    body: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      roles: string[];
      sendInviteEmail?: boolean;
    },
  ): Promise<PlatformUserRow> {
    return firstValueFrom(
      this.http.post<PlatformUserRow>(
        `${this.base}/api/platform/tenants/${tenantId}/users`,
        body,
      ),
    );
  }

  async updateUser(
    tenantId: string,
    userId: string,
    body: {
      email?: string;
      firstName?: string;
      lastName?: string;
      roles?: string[];
      isActive?: boolean;
    },
  ): Promise<PlatformUserRow> {
    return firstValueFrom(
      this.http.put<PlatformUserRow>(
        `${this.base}/api/platform/tenants/${tenantId}/users/${userId}`,
        body,
      ),
    );
  }

  async deleteUser(tenantId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `${this.base}/api/platform/tenants/${tenantId}/users/${userId}`,
      ),
    );
  }
}
