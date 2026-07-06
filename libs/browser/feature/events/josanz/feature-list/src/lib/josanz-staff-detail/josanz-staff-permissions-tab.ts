import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { UsersService, RolesService, type Role } from '@josanz-erp/identity-data-access';
import {
  mergeEffectiveUserPermissions,
  isPermissionAllowedForModules,
  type User,
} from '@josanz-erp/identity-api';
import { GlobalAuthStore, PluginStore, rbacAllows } from '@josanz-erp/shared-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';
import {
  ButtonComponent,
  JosanzFigmaSuccessToastComponent,
  SelectComponent,
  UserAvatarComponent,
  JosanzUserRoleBadgeComponent,
  type JosanzSelectOption,
} from '@josanz-erp/josanz-ui';
import { groupPermissions, permissionLabel, permissionCategory } from '../utils/permission-labels';
import { resolveJosanzUserRoleBadge } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-staff-permissions-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    JosanzFigmaSuccessToastComponent,
    SelectComponent,
    UserAvatarComponent,
    JosanzUserRoleBadgeComponent,
  ],
  templateUrl: './josanz-staff-permissions-tab.html',
  styleUrl: './josanz-staff-permissions-tab.scss',
})
export class JosanzStaffPermissionsTabComponent implements OnInit {
  @Input({ required: true }) userId!: string;

  readonly permissionLabel = permissionLabel;

  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly authStore = inject(GlobalAuthStore);
  private readonly identityAuth = inject(AuthStore);
  private readonly pluginStore = inject(PluginStore);

  readonly canManageUsers = rbacAllows(this.authStore, 'users.manage');
  readonly canViewUsers = rbacAllows(this.authStore, 'users.view', 'users.manage');

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly showToast = signal(false);
  readonly user = signal<User | null>(null);
  readonly catalog = signal<Array<{ id: string; label: string; group: string }>>([]);
  readonly tenantRoles = signal<Role[]>([]);
  readonly draftRoles = signal<string[]>([]);
  readonly draftExtra = signal<string[]>([]);
  readonly pickPermissionId = signal('');

  readonly permissionsPanelOpen = signal(true);
  readonly rolesPanelOpen = signal(true);
  readonly addPermissionsPanelOpen = signal(true);

  readonly isOwnProfile = computed(
    () => (this.authStore.user()?.id ?? '') === this.userId,
  );

  readonly canLoadFromApi = computed(
    () => this.canViewUsers() || this.isOwnProfile(),
  );

  readonly rolePermissions = computed(() => {
    const roles = this.tenantRoles();
    const names = this.draftRoles();
    const rolePerms = new Set<string>();
    for (const roleName of names) {
      const role = roles.find((entry) => entry.name === roleName);
      role?.permissions?.forEach((perm) => rolePerms.add(perm));
    }
    return Array.from(rolePerms);
  });

  readonly effectivePermissionIds = computed(() => {
    const u = this.user();
    if (!u) {
      return [];
    }
    return mergeEffectiveUserPermissions(
      this.rolePermissions(),
      this.draftExtra(),
      u.deniedPermissions ?? [],
      this.pluginStore.enabledPlugins(),
    );
  });

  readonly permissionGroups = computed(() =>
    groupPermissions(this.effectivePermissionIds(), this.draftExtra()),
  );

  readonly hasWildcard = computed(() => this.effectivePermissionIds().includes('*'));

  readonly addableOptions = computed(() => {
    const effective = new Set(this.effectivePermissionIds());
    const modules = this.pluginStore.enabledPlugins();
    return this.catalog()
      .filter(
        (entry) =>
          entry.id !== '*' &&
          !effective.has(entry.id) &&
          isPermissionAllowedForModules(entry.id, modules),
      )
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  });

  readonly permissionSelectOptions = computed((): JosanzSelectOption[] =>
    this.addableOptions().map((opt) => ({
      value: opt.id,
      label: `${permissionCategory(opt.id)} · ${opt.label}`,
    })),
  );

  readonly hasPendingChanges = computed(() => {
    const u = this.user();
    if (!u) {
      return false;
    }
    const savedExtra = [...(u.extraPermissions ?? [])].sort().join('|');
    const draftExtra = [...this.draftExtra()].sort().join('|');
    const savedRoles = [...(u.roles ?? [])].sort().join('|');
    const draftRoles = [...this.draftRoles()].sort().join('|');
    return savedExtra !== draftExtra || savedRoles !== draftRoles;
  });

  readonly pendingDraftCount = computed(() => {
    const savedExtra = new Set(this.user()?.extraPermissions ?? []);
    const savedRoles = new Set(this.user()?.roles ?? []);
    const extraAdded = this.draftExtra().filter((perm) => !savedExtra.has(perm)).length;
    const rolesChanged = this.draftRoles().filter((role) => !savedRoles.has(role)).length
      + [...savedRoles].filter((role) => !this.draftRoles().includes(role)).length;
    return extraAdded + rolesChanged;
  });

  ngOnInit(): void {
    this.load();
  }

  reload(): void {
    this.load();
  }

  onPermissionPicked(id: string): void {
    const permissionId = id.trim();
    this.pickPermissionId.set(permissionId);
    if (!permissionId) {
      return;
    }
    this.addPickedPermission(permissionId);
  }

  addPickedPermission(permissionId = this.pickPermissionId().trim()): void {
    const id = permissionId.trim();
    if (!id || this.draftExtra().includes(id)) {
      return;
    }
    this.draftExtra.update((list) => [...list, id]);
    this.pickPermissionId.set('');
  }

  removeExtraPermission(id: string): void {
    this.draftExtra.update((list) => list.filter((item) => item !== id));
  }

  isRoleSelected(name: string): boolean {
    return this.draftRoles().includes(name);
  }

  toggleRole(name: string, checked: boolean): void {
    this.draftRoles.update((roles) => {
      const next = new Set(roles);
      if (checked) {
        next.add(name);
      } else {
        next.delete(name);
      }
      return Array.from(next);
    });
  }

  rolePermissionSummary(role: Role): string {
    if (role.permissions.includes('*')) {
      return 'Acceso total';
    }
    const count = role.permissions.length;
    return `${count} ${count === 1 ? 'permiso' : 'permisos'}`;
  }

  isElevatedRole(roleName: string): boolean {
    return resolveJosanzUserRoleBadge([roleName]) != null;
  }

  savePermissions(): void {
    if (!this.canManageUsers() || !this.hasPendingChanges() || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.usersService
      .update(this.userId, {
        roles: this.draftRoles(),
        extraPermissions: this.draftExtra(),
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.draftRoles.set([...(updated.roles ?? [])]);
          this.draftExtra.set([...(updated.extraPermissions ?? [])]);
          this.showToast.set(true);
        },
        error: () => {
          this.error.set('No se pudieron guardar los cambios. Inténtalo de nuevo.');
        },
      });
  }

  dismissToast(): void {
    this.showToast.set(false);
  }

  private load(): void {
    if (!this.canLoadFromApi()) {
      this.loading.set(false);
      this.error.set('No tienes permiso para consultar los permisos de este usuario.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    if (this.isOwnProfile() && !this.canViewUsers()) {
      const sessionUser = this.identityAuth.user();
      if (!sessionUser) {
        this.loading.set(false);
        this.error.set('No se pudo cargar tu sesión.');
        return;
      }
      const mapped: User = {
        id: sessionUser.id,
        email: sessionUser.email,
        firstName: sessionUser.firstName,
        lastName: sessionUser.lastName,
        isActive: true,
        roles: sessionUser.roles ?? [],
        permissions: sessionUser.permissions ?? [],
        extraPermissions: sessionUser.extraPermissions ?? [],
        deniedPermissions: sessionUser.deniedPermissions ?? [],
        createdAt: new Date().toISOString(),
      };
      this.user.set(mapped);
      this.draftRoles.set([...(mapped.roles ?? [])]);
      this.draftExtra.set([...(mapped.extraPermissions ?? [])]);
      this.catalog.set([]);
      this.loading.set(false);
      return;
    }

    forkJoin({
      user: this.usersService.findById(this.userId),
      roles: this.rolesService.findAll(),
      catalog: this.rolesService.getPermissionsCatalog(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ user, roles, catalog }) => {
          if (!user) {
            this.error.set('Usuario no encontrado.');
            return;
          }
          this.user.set(user);
          this.tenantRoles.set(roles);
          this.catalog.set(catalog);
          this.draftRoles.set([...(user.roles ?? [])]);
          this.draftExtra.set([...(user.extraPermissions ?? [])]);
        },
        error: () => {
          this.error.set('No se pudieron cargar los permisos del usuario.');
        },
      });
  }
}