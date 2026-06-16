import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';
import { RolesService, AuthStore, type Role } from '@josanz-erp/identity-data-access';
import { PERMISSIONS_CATALOG } from '@josanz-erp/identity-data-access';
import { isPermissionAllowedForModules } from '@josanz-erp/identity-api';
import { PluginStore } from '@josanz-erp/shared-data-access';
import { RoleType } from '@josanz-erp/identity-core';

@Component({
  selector: 'lib-settings-roles-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCardComponent, UiButtonComponent, UiLoaderComponent],
  template: `
    <section class="content-section roles-management animate-fade-in">
      <div class="roles-header-main">
        <div class="section-title">
          <h2>Gestión de Roles y Permisos</h2>
          <p>Define quién puede hacer qué en cada módulo del sistema</p>
        </div>
        <ui-button variant="filled" size="sm" (clicked)="createNewRole()">
          <lucide-icon name="plus" size="16" aria-hidden="true"></lucide-icon> Nuevo Rol
        </ui-button>
      </div>

      @if (rolesLoadError()) {
        <div class="feature-load-error-banner" role="status" aria-live="polite">
          <lucide-icon name="alert-circle" size="20" class="feature-load-error-banner__icon" aria-hidden="true"></lucide-icon>
          <span class="feature-load-error-banner__text">{{ rolesLoadError() }}</span>
          <ui-button variant="ghost" size="sm" icon="rotate-cw" (clicked)="loadRoles()">Reintentar</ui-button>
        </div>
      }

      @if (isLoadingRoles() && roles().length === 0 && !rolesLoadError()) {
        <div class="feature-loader-wrap">
          <ui-loader message="Cargando roles…"></ui-loader>
        </div>
      }

      <div class="roles-layout-grid">
        <div class="roles-selector-card">
          <div class="selector-header">Roles Disponibles</div>
          <div class="current-user-rbac-note">
            <span>Sesión actual</span>
            <strong>{{ currentUserRolesLabel() }}</strong>
          </div>
          <div class="roles-list-scroll">
            @for (role of roles(); track role.id) {
              <div class="role-item-btn" [class.active]="selectedRoleId() === role.id" 
                [class.current-user-role]="roleAffectsCurrentUser(role)"
                (click)="selectedRoleId.set(role.id)" 
                (keydown.enter)="selectedRoleId.set(role.id)"
                (keydown.space)="selectedRoleId.set(role.id)"
                tabindex="0" role="button" [attr.aria-label]="'Seleccionar rol ' + role.name">
                <div class="role-icon-indicator" [class]="role.type"></div>
                <div class="role-label-content">
                  <span class="role-name-text">{{ role.name }}</span>
                  <span class="role-type-pill">{{ role.type }}</span>
                  @if (roleAffectsCurrentUser(role)) {
                    <span class="current-role-pill">Tu sesión</span>
                  }
                </div>
                <lucide-icon name="chevron-right" size="14" class="chevron" aria-hidden="true"></lucide-icon>
              </div>
            }
          </div>
        </div>

        <div class="role-matrix-detail">
          @if (selectedRole(); as role) {
            <ui-card variant="glass" class="role-config-card" [class.readonly-role]="isSelectedRoleSuperAdmin()">
              <div class="role-config-header">
                <div class="role-main-info">
                  <span class="role-name-text">{{ role.name }}</span>
                  <div class="role-actions-btns">
                    @if (!isSelectedRoleSuperAdmin()) {
                      <ui-button variant="outline" size="sm" (clicked)="deleteRole(role.id)">
                        <lucide-icon name="trash-2" size="14" aria-hidden="true"></lucide-icon> Eliminar Rol
                      </ui-button>
                    }
                  </div>
                </div>
                @if (isSelectedRoleSuperAdmin()) {
                  <p class="role-locked-notice">El rol <strong>SuperAdmin</strong> está protegido: el acceso total no se modifica desde aquí.</p>
                }
                @if (!selectedRoleAffectsCurrentUser()) {
                  <p class="role-session-notice">
                    Este rol no pertenece a la sesión actual. Cambiarlo afectará a usuarios con <strong>{{ role.name }}</strong>, pero no al menú de <strong>{{ currentUserEmail() }}</strong>.
                  </p>
                }
                <p class="role-description-hint">
                  @if (!isSelectedRoleSuperAdmin()) { Configura los permisos para el rol <strong>{{ role.name }}</strong> }
                  @else { Vista de solo lectura de los permisos del rol <strong>{{ role.name }}</strong> }
                </p>
              </div>

              <div class="permissions-matrix-container">
                @for (category of permissionCategoryOrder; track category) {
                  @if (categoryHasVisiblePerms(category)) {
                    <div class="permission-group">
                      <h4 class="category-title">{{ category }}</h4>
                      <div class="permission-items-grid">
                        @for (perm of permissionsCatalogForUi(); track perm.id) {
                          @if (perm.category === category) {
                            <div class="permission-toggle-box" [class.active]="isPermissionActive(role.id, perm.id)" [class.readonly-perm]="isSelectedRoleSuperAdmin()" 
                              (click)="togglePermission(role.id, perm.id)" 
                              (keydown.enter)="togglePermission(role.id, perm.id)"
                              (keydown.space)="togglePermission(role.id, perm.id)"
                              [tabindex]="isSelectedRoleSuperAdmin() ? -1 : 0" 
                              role="switch" 
                              [attr.aria-disabled]="isSelectedRoleSuperAdmin()" 
                              [attr.aria-checked]="isPermissionActive(role.id, perm.id)" 
                              [attr.aria-label]="'Alternar permiso ' + perm.label">
                              <div class="toggle-info">
                                <span class="perm-label">{{ perm.label }}</span>
                                <span class="perm-id">{{ perm.id }}</span>
                              </div>
                              <div class="toggle-ui">
                                <div class="toggle-pill"></div>
                              </div>
                            </div>
                          }
                        }
                      </div>
                    </div>
                  }
                }
              </div>
            </ui-card>
          } @else {
            <div class="no-role-selected">
              <lucide-icon name="shield-alert" size="48" class="mb-4 opacity-20" aria-hidden="true"></lucide-icon>
              <p>Selecciona un rol para ver y editar sus permisos</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .roles-header-main { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }

      .section-title h2 { font-size: 1.5rem; font-weight: 900; color: #fff; margin: 0; letter-spacing: -0.02em; }
      .section-title p { font-size: 0.9rem; color: #64748b; margin: 0.5rem 0 0 0; }

      .feature-load-error-banner { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; margin-bottom: 1.5rem; }
      .feature-load-error-banner__icon { color: #f87171; }
      .feature-load-error-banner__text { flex: 1; color: #e2e8f0; font-size: 0.85rem; }

      .roles-layout-grid { display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; align-items: flex-start; width: 100%; min-width: 0; overflow: hidden; }

      .roles-selector-card {
        background: color-mix(in srgb, var(--surface) 88%, var(--brand) 2%);
        backdrop-filter: blur(40px) saturate(2);
        border: 1px solid color-mix(in srgb, var(--border-soft) 40%, white 5%);
        border-radius: 28px;
        display: flex;
        flex-direction: column;
        max-height: 800px;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        min-width: 0;
      }

      .selector-header { padding: 1.75rem; font-weight: 900; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.25em; color: var(--brand); border-bottom: 1px solid rgba(255, 255, 255, 0.05); }

      .current-user-rbac-note { margin: 1rem 1.25rem 0; padding: 0.85rem 0.95rem; border-radius: 16px; background: rgba(251, 113, 133, 0.08); border: 1px solid rgba(251, 113, 133, 0.18); display: flex; flex-direction: column; gap: 0.25rem; }
      .current-user-rbac-note span { font-size: 0.58rem; font-weight: 900; color: #fda4af; text-transform: uppercase; letter-spacing: 0.16em; }
      .current-user-rbac-note strong { color: #f8fafc; font-size: 0.82rem; line-height: 1.3; }

      .roles-list-scroll { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }

      .role-item-btn {
        display: flex; align-items: center; gap: 1rem; padding: 1.15rem; border-radius: 18px; cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid transparent; background: rgba(255, 255, 255, 0.03); position: relative; overflow: hidden;
      }
      .role-item-btn:hover { background: rgba(255, 255, 255, 0.06); transform: translateX(6px); border-color: rgba(255, 255, 255, 0.08); }
      .role-item-btn.active { background: color-mix(in srgb, var(--brand) 12%, var(--surface)); border-color: color-mix(in srgb, var(--brand) 45%, transparent); box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.4); }
      .role-item-btn.current-user-role { border-color: rgba(34, 197, 94, 0.3); }
      .role-item-btn.active::after { content: ''; position: absolute; left: 0; top: 25%; height: 50%; width: 3px; background: var(--brand); border-radius: 0 4px 4px 0; box-shadow: 0 0 15px var(--brand); }

      .role-icon-indicator { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; position: relative; background: currentColor; }
      .role-icon-indicator::after { content: ''; position: absolute; inset: -6px; border-radius: 50%; background: currentColor; opacity: 0.3; filter: blur(8px); }
      .role-icon-indicator.SUPERADMIN { color: #facc15; }
      .role-icon-indicator.ADMIN { color: #3b82f6; }
      .role-icon-indicator.RESPONSIBLE { color: #10b981; }
      .role-icon-indicator.USER { color: #94a3b8; }

      .role-label-content { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
      .role-name-text { font-weight: 800; font-size: 0.9rem; color: var(--text-primary); letter-spacing: -0.01em; }
      .role-type-pill { font-size: 0.6rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.6; }
      .current-role-pill { width: fit-content; font-size: 0.55rem; font-weight: 900; color: #86efac; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.22); border-radius: 999px; padding: 0.18rem 0.42rem; text-transform: uppercase; letter-spacing: 0.12em; }

      .role-item-btn .chevron { opacity: 0.2; transition: all 0.3s ease; color: #fff; }
      .role-item-btn.active .chevron { opacity: 0.8; transform: translateX(4px) scale(1.2); color: var(--brand); }

      .role-matrix-detail { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2rem; overflow: hidden; }

      .role-config-card { padding: 0; background: color-mix(in srgb, var(--surface) 85%, var(--brand) 2%) !important; border: 1px solid var(--border-soft) !important; border-radius: 32px; overflow: hidden; }

      .role-config-header { padding: 3rem; background: color-mix(in srgb, var(--surface) 60%, transparent); border-bottom: 1px solid var(--border-soft); }

      .role-main-info { display: flex; justify-content: space-between; align-items: flex-end; gap: 3rem; margin-bottom: 1rem; }

      .role-actions-btns { flex-shrink: 0; }

      .role-description-hint { font-size: 0.95rem; color: var(--text-secondary) !important; margin-top: 0.75rem; max-width: 600px; line-height: 1.6; }

      .role-locked-notice { font-size: 0.8rem; font-weight: 700; color: var(--brand); margin-bottom: 1.5rem; padding: 1.25rem 1.5rem; background: color-mix(in srgb, var(--brand) 12%, transparent); border-radius: 16px; border-left: 4px solid var(--brand); backdrop-filter: blur(10px); }
      .role-session-notice { font-size: 0.8rem; font-weight: 700; color: #fde68a; margin: 0 0 1rem; padding: 1rem 1.25rem; background: rgba(251, 191, 36, 0.1); border-radius: 14px; border-left: 4px solid #fbbf24; }

      .permissions-matrix-container { padding: 3rem; display: flex; flex-direction: column; gap: 4rem; }

      .category-title { font-size: 1rem; font-weight: 900; color: var(--text-primary) !important; margin-bottom: 2rem; display: flex; align-items: center; gap: 1.25rem; letter-spacing: 0.15em; text-transform: uppercase; }
      .category-title::before { content: ''; width: 4px; height: 24px; background: var(--brand); border-radius: 2px; box-shadow: 0 0 15px var(--brand); }

      .permission-items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; width: 100%; }

      .permission-toggle-box {
        background: color-mix(in srgb, var(--surface) 70%, transparent);
        border: 1px solid var(--border-soft);
        border-radius: 20px;
        padding: 1.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
      }
      .permission-toggle-box:hover { background: rgba(255, 255, 255, 0.04); transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3); border-color: color-mix(in srgb, var(--brand) 25%, var(--border-soft)); }
      .permission-toggle-box.active { background: color-mix(in srgb, var(--brand) 12%, var(--surface)); border-color: var(--brand); }
      .permission-toggle-box.active::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--brand) 15%, transparent), transparent 70%); pointer-events: none; }

      .toggle-info { display: flex; flex-direction: column; }
      .perm-label { font-weight: 800; font-size: 0.95rem; color: var(--text-primary) !important; letter-spacing: -0.01em; }
      .perm-id { font-size: 0.65rem; font-family: 'JetBrains Mono', monospace; color: var(--brand); opacity: 0.7; margin-top: 0.25rem; font-weight: 600; letter-spacing: 0.05em; }

      .toggle-ui { width: 52px; height: 28px; background: rgba(255, 255, 255, 0.08); border-radius: 99px; position: relative; border: 1px solid rgba(255, 255, 255, 0.05); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      .toggle-pill { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4); }

      .permission-toggle-box.active .toggle-ui { background: var(--brand); border-color: rgba(255, 255, 255, 0.2); box-shadow: 0 0 15px color-mix(in srgb, var(--brand) 40%, transparent); }
      .permission-toggle-box.active .toggle-pill { left: 27px; background: var(--text-on-brand, #fff); box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }

      .no-role-selected { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); text-align: center; }
    `,
  ],
})
export class SettingsRolesTabComponent implements OnInit {
  private readonly _pluginStore = inject(PluginStore);
  private readonly _rolesService = inject(RolesService);
  private readonly _authStore = inject(AuthStore);

  readonly roles = signal<Role[]>([]);
  readonly selectedRoleId = signal<string | null>(null);
  readonly isLoadingRoles = signal(false);
  readonly rolesLoadError = signal<string | null>(null);

  readonly selectedRole = computed(() => this.roles().find(r => r.id === this.selectedRoleId()) || null);
  readonly currentUserRoleNames = computed(() => this._authStore.user()?.roles ?? []);
  readonly currentUserEmail = computed(() => this._authStore.user()?.email ?? 'tu usuario');
  readonly currentUserRolesLabel = computed(() => {
    const roles = this.currentUserRoleNames();
    return roles.length > 0 ? roles.join(', ') : 'Sin roles asignados';
  });
  readonly selectedRoleAffectsCurrentUser = computed(() => {
    const role = this.selectedRole();
    return !!role && this.roleAffectsCurrentUser(role);
  });

  readonly permissionCategoryOrder = [
    'Sistema', 'General', 'Identidad', 'CRM/Clientes', 'Inventario',
    'Finanzas', 'Operaciones', 'Analítica', 'Cumplimiento', 'Logística',
  ] as const;

  readonly permissionsCatalogForUi = computed(() => {
    const enabled = this._pluginStore.enabledPlugins();
    return PERMISSIONS_CATALOG.filter(p => isPermissionAllowedForModules(p.id, enabled));
  });

  readonly isSelectedRoleSuperAdmin = computed(() => this.selectedRole()?.type === RoleType.SUPERADMIN);

  ngOnInit(): void {
    this.loadRoles();
  }

  categoryHasVisiblePerms(category: string): boolean {
    return this.permissionsCatalogForUi().some(p => p.category === category);
  }

  isPermissionActive(roleId: string, permissionId: string): boolean {
    const role = this.roles().find(r => r.id === roleId);
    if (!role) return false;
    return role.permissions.includes('*') || role.permissions.includes(permissionId);
  }

  roleAffectsCurrentUser(role: Role): boolean {
    return this.currentUserRoleNames().includes(role.name);
  }

  togglePermission(roleId: string, permissionId: string): void {
    const role = this.roles().find((r: Role) => r.id === roleId);
    if (!role) return;
    if (role.type === RoleType.SUPERADMIN) return;

    let permissions = [...role.permissions];

    if (permissionId === '*') {
      if (permissions.includes('*')) {
        permissions = [];
      } else {
        permissions = ['*'];
      }
    } else if (permissions.includes('*')) {
      const allPerms = this.permissionsCatalogForUi().map(p => p.id).filter(id => id !== '*' && id !== permissionId);
      permissions = allPerms;
    } else {
      permissions = permissions.includes(permissionId) ? permissions.filter(p => p !== permissionId) : [...permissions, permissionId];
    }

    this._rolesService.update(roleId, { permissions }).subscribe({
      next: (updated: Role) => {
        this.roles.update(list => list.map(r => r.id === roleId ? updated : r));
        this._authStore.refreshSession();
      },
    });
  }

  createNewRole(): void {
    const name = prompt('Nombre del nuevo rol:');
    if (!name) return;
    this._rolesService.create({ name, type: RoleType.USER, permissions: [] }).subscribe({
      next: (newRole: Role) => {
        this.roles.update(list => [...list, newRole]);
        this.selectedRoleId.set(newRole.id);
      },
    });
  }

  deleteRole(id: string): void {
    const r = this.roles().find(x => x.id === id);
    if (r?.type === RoleType.SUPERADMIN) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) return;
    this._rolesService.delete(id).subscribe({
      next: () => {
        this.roles.update(list => list.filter(r => r.id !== id));
        if (this.selectedRoleId() === id) {
          this.selectedRoleId.set(this.roles()[0]?.id || null);
        }
      },
    });
  }

  loadRoles(): void {
    this.rolesLoadError.set(null);
    this.isLoadingRoles.set(true);
    this._rolesService.findAll().subscribe({
      next: (roles: Role[]) => {
        this.roles.set(roles);
        if (roles.length > 0 && !this.selectedRoleId()) {
          const currentRole = roles.find((role) => this.roleAffectsCurrentUser(role));
          this.selectedRoleId.set(currentRole?.id ?? roles[0].id);
        }
        this.isLoadingRoles.set(false);
      },
      error: () => {
        this.isLoadingRoles.set(false);
        this.rolesLoadError.set('No se pudieron cargar los roles. Comprueba la conexión e inténtalo de nuevo.');
      },
    });
  }
}