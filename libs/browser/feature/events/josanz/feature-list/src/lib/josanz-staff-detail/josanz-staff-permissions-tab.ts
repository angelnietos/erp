import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { UsersService, RolesService } from '@josanz-erp/identity-data-access';
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
  type JosanzSelectOption,
} from '@josanz-erp/josanz-ui';
import { groupPermissions, permissionLabel, permissionCategory } from '../utils/permission-labels';

@Component({
  selector: 'josanz-staff-permissions-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    JosanzFigmaSuccessToastComponent,
    SelectComponent,
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
  readonly rolePermissions = signal<string[]>([]);
  readonly draftExtra = signal<string[]>([]);
  readonly pickPermissionId = signal('');

  readonly isOwnProfile = computed(
    () => (this.authStore.user()?.id ?? '') === this.userId,
  );

  readonly canLoadFromApi = computed(
    () => this.canViewUsers() || this.isOwnProfile(),
  );

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
    const saved = [...(u.extraPermissions ?? [])].sort().join('|');
    const draft = [...this.draftExtra()].sort().join('|');
    return saved !== draft;
  });

  ngOnInit(): void {
    this.load();
  }

  reload(): void {
    this.load();
  }

  addPickedPermission(): void {
    const id = this.pickPermissionId().trim();
    if (!id || this.draftExtra().includes(id)) {
      return;
    }
    this.draftExtra.update((list) => [...list, id]);
    this.pickPermissionId.set('');
  }

  removeExtraPermission(id: string): void {
    this.draftExtra.update((list) => list.filter((item) => item !== id));
  }

  saveExtraPermissions(): void {
    if (!this.canManageUsers() || !this.hasPendingChanges() || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.usersService
      .update(this.userId, { extraPermissions: this.draftExtra() })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.draftExtra.set([...(updated.extraPermissions ?? [])]);
          this.showToast.set(true);
        },
        error: () => {
          this.error.set('No se pudieron guardar los permisos. Inténtalo de nuevo.');
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
      this.draftExtra.set([...(mapped.extraPermissions ?? [])]);
      this.rolePermissions.set(mapped.permissions.filter((p) => p !== '*'));
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
          this.catalog.set(catalog);
          this.draftExtra.set([...(user.extraPermissions ?? [])]);

          const rolePerms = new Set<string>();
          for (const roleName of user.roles ?? []) {
            const role = roles.find((r) => r.name === roleName);
            role?.permissions?.forEach((perm) => rolePerms.add(perm));
          }
          this.rolePermissions.set(Array.from(rolePerms));
        },
        error: () => {
          this.error.set('No se pudieron cargar los permisos del usuario.');
        },
      });
  }
}
