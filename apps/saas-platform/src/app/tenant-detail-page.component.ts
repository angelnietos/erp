import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  PlatformTenantApiService,
  type PlatformRoleRow,
  type PlatformUserRow,
  type PermissionOption,
  type PlatformTenantRow,
} from './platform-tenant-api.service';
import {
  TENANT_MODULE_CATALOG_SAAS,
} from './tenant-module-catalog';
import {
  platformTenantDisplayName,
  platformTenantRealmHint,
  platformTenantSlugLabel,
} from './platform-tenant-display';

type TabId = 'modules' | 'roles' | 'users';

@Component({
  standalone: true,
  selector: 'app-tenant-detail-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tenant-detail-page.component.html',
  styleUrl: './tenant-detail-page.component.css',
})
export class TenantDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PlatformTenantApiService);

  readonly tenantId = signal('');
  readonly tenant = signal<PlatformTenantRow | null>(null);
  readonly activeTab = signal<TabId>('roles');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly roles = signal<PlatformRoleRow[]>([]);
  readonly users = signal<PlatformUserRow[]>([]);
  readonly permissionOptions = signal<PermissionOption[]>([]);
  readonly catalog = TENANT_MODULE_CATALOG_SAAS;

  readonly selectedRoleId = signal<string | null>(null);
  readonly roleDraftName = signal('');
  readonly roleDraftDescription = signal('');
  readonly roleDraftPermissions = signal<string[]>([]);
  readonly savingRole = signal(false);

  readonly showUserForm = signal(false);
  readonly editingUserId = signal<string | null>(null);
  readonly userEmail = signal('');
  readonly userPassword = signal('');
  readonly userFirstName = signal('');
  readonly userLastName = signal('');
  readonly userRoles = signal<string[]>([]);
  readonly userActive = signal(true);
  readonly savingUser = signal(false);

  readonly moduleDraft = signal<string[]>([]);
  readonly savingModules = signal(false);
  readonly syncingKc = signal(false);
  readonly pullEmail = signal('');
  readonly pullingKc = signal(false);

  readonly selectedRole = computed(() =>
    this.roles().find((r) => r.id === this.selectedRoleId()) ?? null,
  );

  readonly permissionsByGroup = computed(() => {
    const map = new Map<string, PermissionOption[]>();
    for (const p of this.permissionOptions()) {
      const g = p.group || 'General';
      map.set(g, [...(map.get(g) ?? []), p]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'));
  });

  readonly roleNames = computed(() => this.roles().map((r) => r.name));

  constructor() {
    const id = this.route.snapshot.paramMap.get('tenantId') ?? '';
    this.tenantId.set(id);
    void this.bootstrap(id);
  }

  setTab(tab: TabId): void {
    this.activeTab.set(tab);
    this.error.set(null);
    this.success.set(null);
  }

  isModuleOn(moduleId: string): boolean {
    return this.moduleDraft().includes(moduleId);
  }

  toggleModule(moduleId: string, checked: boolean): void {
    const set = new Set(this.moduleDraft());
    if (checked) set.add(moduleId);
    else set.delete(moduleId);
    this.moduleDraft.set([...set]);
  }

  async saveModules(): Promise<void> {
    const id = this.tenantId();
    this.savingModules.set(true);
    this.error.set(null);
    try {
      await this.api.updateModules(id, this.moduleDraft());
      this.tenant.update((t) =>
        t ? { ...t, enabledModuleIds: [...this.moduleDraft()] } : t,
      );
      this.success.set('Módulos actualizados.');
    } catch {
      this.error.set('No se pudieron guardar los módulos.');
    } finally {
      this.savingModules.set(false);
    }
  }

  selectRole(role: PlatformRoleRow): void {
    this.selectedRoleId.set(role.id);
    this.roleDraftName.set(role.name);
    this.roleDraftDescription.set(role.description ?? '');
    this.roleDraftPermissions.set([...role.permissions]);
  }

  startNewRole(): void {
    this.selectedRoleId.set(null);
    this.roleDraftName.set('');
    this.roleDraftDescription.set('');
    this.roleDraftPermissions.set([]);
  }

  toggleRolePermission(permId: string, checked: boolean): void {
    const set = new Set(this.roleDraftPermissions());
    if (checked) set.add(permId);
    else set.delete(permId);
    this.roleDraftPermissions.set([...set]);
  }

  hasRolePermission(permId: string): boolean {
    return this.roleDraftPermissions().includes(permId);
  }

  async saveRole(): Promise<void> {
    const id = this.tenantId();
    const name = this.roleDraftName().trim();
    if (!name) {
      this.error.set('El nombre del rol es obligatorio.');
      return;
    }
    this.savingRole.set(true);
    this.error.set(null);
    try {
      const selected = this.selectedRoleId();
      if (selected) {
        await this.api.updateRole(id, selected, {
          name,
          description: this.roleDraftDescription().trim() || undefined,
          permissions: this.roleDraftPermissions(),
        });
      } else {
        await this.api.createRole(id, {
          name,
          description: this.roleDraftDescription().trim() || undefined,
          type: 'USER',
          permissions: this.roleDraftPermissions(),
        });
      }
      await this.loadRoles(id);
      this.success.set('Rol guardado.');
    } catch {
      this.error.set('Error al guardar el rol.');
    } finally {
      this.savingRole.set(false);
    }
  }

  async removeRole(role: PlatformRoleRow): Promise<void> {
    if (role.type === 'SUPERADMIN') return;
    if (!window.confirm(`Eliminar rol "${role.name}"?`)) return;
    try {
      await this.api.deleteRole(this.tenantId(), role.id);
      if (this.selectedRoleId() === role.id) this.startNewRole();
      await this.loadRoles(this.tenantId());
      this.success.set('Rol eliminado.');
    } catch {
      this.error.set('No se pudo eliminar el rol.');
    }
  }

  openCreateUser(): void {
    this.editingUserId.set(null);
    this.userEmail.set('');
    this.userPassword.set('');
    this.userFirstName.set('');
    this.userLastName.set('');
    this.userRoles.set([]);
    this.userActive.set(true);
    this.showUserForm.set(true);
  }

  openEditUser(user: PlatformUserRow): void {
    this.editingUserId.set(user.id);
    this.userEmail.set(user.email);
    this.userPassword.set('');
    this.userFirstName.set(user.firstName ?? '');
    this.userLastName.set(user.lastName ?? '');
    this.userRoles.set([...user.roles]);
    this.userActive.set(user.isActive);
    this.showUserForm.set(true);
  }

  toggleUserRole(roleName: string, checked: boolean): void {
    const set = new Set(this.userRoles());
    if (checked) set.add(roleName);
    else set.delete(roleName);
    this.userRoles.set([...set]);
  }

  async saveUser(): Promise<void> {
    const tenantId = this.tenantId();
    const email = this.userEmail().trim();
    if (!email) {
      this.error.set('Email obligatorio.');
      return;
    }
    this.savingUser.set(true);
    this.error.set(null);
    try {
      const editing = this.editingUserId();
      if (editing) {
        await this.api.updateUser(tenantId, editing, {
          email,
          firstName: this.userFirstName().trim() || undefined,
          lastName: this.userLastName().trim() || undefined,
          roles: this.userRoles(),
          isActive: this.userActive(),
        });
      } else {
        const pw = this.userPassword();
        if (pw.length < 6) {
          this.error.set('Contraseña mínima 6 caracteres.');
          return;
        }
        await this.api.createUser(tenantId, {
          email,
          password: pw,
          firstName: this.userFirstName().trim() || undefined,
          lastName: this.userLastName().trim() || undefined,
          roles: this.userRoles(),
          sendInviteEmail: false,
        });
      }
      this.showUserForm.set(false);
      await this.loadUsers(tenantId);
      this.success.set('Usuario guardado.');
    } catch {
      this.error.set('Error al guardar usuario.');
    } finally {
      this.savingUser.set(false);
    }
  }

  async removeUser(user: PlatformUserRow): Promise<void> {
    if (!window.confirm(`Eliminar ${user.email}?`)) return;
    try {
      await this.api.deleteUser(this.tenantId(), user.id);
      await this.loadUsers(this.tenantId());
      this.success.set('Usuario eliminado.');
    } catch {
      this.error.set('No se pudo eliminar el usuario.');
    }
  }

  async pushAllToKeycloak(): Promise<void> {
    const id = this.tenantId();
    this.syncingKc.set(true);
    this.error.set(null);
    try {
      const result = await this.api.pushTenantToKeycloak(id);
      if (result.skipped) {
        this.success.set(result.reason ?? 'Tenant sin Keycloak.');
      } else if (result.ok) {
        this.success.set(
          `Keycloak: ${result.rolesEnsured ?? 0} roles, ${result.usersSynced ?? 0} usuarios.`,
        );
      } else {
        const detail = result.errors?.join('; ') ?? result.reason;
        this.error.set(detail ?? 'Error de sincronización.');
      }
    } catch {
      this.error.set('No se pudo sincronizar con Keycloak.');
    } finally {
      this.syncingKc.set(false);
    }
  }

  async pullUserFromKeycloak(): Promise<void> {
    const email = this.pullEmail().trim();
    if (!email) {
      this.error.set('Email para importar desde Keycloak.');
      return;
    }
    this.pullingKc.set(true);
    this.error.set(null);
    try {
      const result = await this.api.pullUserFromKeycloak(this.tenantId(), email);
      if (result.ok) {
        await this.loadUsers(this.tenantId());
        this.success.set(`Usuario ${email} importado desde Keycloak.`);
        this.pullEmail.set('');
      } else {
        this.error.set(result.reason ?? 'No se pudo importar.');
      }
    } catch {
      this.error.set('Error al importar desde Keycloak.');
    } finally {
      this.pullingKc.set(false);
    }
  }

  async syncUserToKeycloak(user: PlatformUserRow): Promise<void> {
    try {
      const result = await this.api.syncTenantUserToKeycloak(
        this.tenantId(),
        user.id,
      );
      if (result.ok) {
        this.success.set(`${user.email} sincronizado con Keycloak.`);
      } else {
        this.error.set(result.reason ?? 'Error de sincronización.');
      }
    } catch {
      this.error.set('No se pudo sincronizar el usuario.');
    }
  }

  moduleLabel(id: string): string {
    return this.catalog.find((m) => m.id === id)?.label ?? id;
  }

  private async bootstrap(tenantId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const tenants = await this.api.listTenants();
      const row = tenants.find((t) => t.id === tenantId) ?? null;
      if (!row) {
        this.error.set('Organización no encontrada.');
        return;
      }
      this.tenant.set(row);
      this.moduleDraft.set([...row.enabledModuleIds]);
      await Promise.all([
        this.loadRoles(tenantId),
        this.loadUsers(tenantId),
        this.loadPermissionOptions(tenantId),
      ]);
    } catch {
      this.error.set('Error cargando la organización.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadRoles(tenantId: string): Promise<void> {
    this.roles.set(await this.api.listRoles(tenantId));
  }

  private async loadUsers(tenantId: string): Promise<void> {
    this.users.set(await this.api.listUsers(tenantId));
  }

  private async loadPermissionOptions(tenantId: string): Promise<void> {
    this.permissionOptions.set(await this.api.listPermissionOptions(tenantId));
  }

  displayName(t: PlatformTenantRow): string {
    return platformTenantDisplayName(t);
  }

  displaySlug(slug: string): string {
    return platformTenantSlugLabel(slug);
  }

  realmHint(t: PlatformTenantRow): string {
    return platformTenantRealmHint(t);
  }
}
