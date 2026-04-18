import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiLoaderComponent,
  UiInputComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  UsersService,
  RolesService,
  Role,
} from '@josanz-erp/identity-data-access';
import { User, UpdateUserDto, CreateUserDto } from '@josanz-erp/identity-api';
import { ThemeService, PluginStore, ToastService } from '@josanz-erp/shared-data-access';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'lib-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    UiButtonComponent,
    UiLoaderComponent,
    UiInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="user-edit animate-fade-in">
      @if (isLoading()) {
        <div class="loader-wrap">
          <ui-loader
            [message]="createMode() ? 'Cargando roles y permisos…' : 'Cargando usuario…'"
          ></ui-loader>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <lucide-icon name="alert-circle" size="48" class="error-icon"></lucide-icon>
          <p>{{ error() }}</p>
          <div class="error-actions">
            <ui-button variant="solid" (clicked)="reload()">Reintentar</ui-button>
            <ui-button variant="ghost" routerLink="/users">Volver</ui-button>
          </div>
        </div>
      } @else {
        <div class="header-bar">
          <button
            type="button"
            class="back-btn"
            [routerLink]="createMode() ? ['/users'] : ['/users', userId()]"
          >
            <lucide-icon name="arrow-left" size="18"></lucide-icon>
          </button>
          <h1 class="title">{{ createMode() ? 'Alta de usuario' : 'Editar usuario' }}</h1>
        </div>

        <form class="form-card" (ngSubmit)="save()">
          <ui-input
            label="Nombre"
            [(ngModel)]="draft.firstName"
            name="firstName"
            icon="user"
          />
          <ui-input
            label="Apellidos"
            [(ngModel)]="draft.lastName"
            name="lastName"
            icon="user"
          />
          <ui-input
            label="Email"
            [(ngModel)]="draft.email"
            name="email"
            icon="mail"
            type="email"
          />
          @if (createMode()) {
            <ui-input
              label="Contraseña"
              [(ngModel)]="draft.password"
              name="password"
              icon="lock"
              type="password"
              [attr.autocomplete]="'new-password'"
            />
            <ui-input
              label="Repetir contraseña"
              [(ngModel)]="draft.passwordConfirm"
              name="passwordConfirm"
              icon="lock"
              type="password"
              [attr.autocomplete]="'new-password'"
            />
            <p class="pw-hint">Mínimo 6 caracteres. El usuario podrá iniciar sesión con este correo.</p>
          }
          @if (!createMode()) {
            <div class="toggle-row">
              <label class="chk">
                <input type="checkbox" [(ngModel)]="draft.isActive" name="isActive" />
                <span>Usuario activo</span>
              </label>
            </div>
          }

          <section class="section">
            <h2 class="section-title">Roles del tenant</h2>
            <p class="section-hint">Un usuario puede tener varios roles; los permisos se unen.</p>
            <div class="role-grid">
              @for (r of tenantRoles(); track r.id) {
                <label class="role-pill">
                  <input
                    type="checkbox"
                    [checked]="isRoleSelected(r.name)"
                    (change)="toggleRole(r.name, $any($event.target).checked)"
                  />
                  <span>{{ r.name }}</span>
                  <span class="role-type">{{ r.type }}</span>
                </label>
              }
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">Permisos adicionales</h2>
            <p class="section-hint">
              Añade permisos puntuales fuera del alcance de los roles (p. ej. solo ver clientes).
            </p>
            @for (g of permissionGroups(); track g.name) {
              <div class="perm-group">
                <h3 class="perm-group-title">{{ g.name }}</h3>
                <div class="perm-grid">
                  @for (p of g.items; track p.id) {
                    <label class="perm-row">
                      <input
                        type="checkbox"
                        [checked]="draft.extraPermissions.includes(p.id)"
                        (change)="toggleExtra(p.id, $any($event.target).checked)"
                      />
                      <span>{{ p.label }}</span>
                    </label>
                  }
                </div>
              </div>
            }
          </section>

          <div class="actions">
            <ui-button type="button" variant="ghost" routerLink="/users">Cancelar</ui-button>
            <ui-button type="submit" variant="solid" icon="save" [disabled]="saving()">
              {{
                saving()
                  ? createMode()
                    ? 'Creando…'
                    : 'Guardando…'
                  : createMode()
                    ? 'Crear usuario'
                    : 'Guardar'
              }}
            </ui-button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .user-edit {
        max-width: 720px;
        margin: 0 auto;
        padding: 2rem;
      }
      .loader-wrap,
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4rem;
        gap: 1rem;
        text-align: center;
      }
      .error-icon {
        color: var(--error);
        opacity: 0.9;
      }
      .error-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 0.5rem;
      }
      .header-bar {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .back-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        border: 1px solid var(--border-soft);
        background: var(--surface);
        color: var(--text-primary);
        cursor: pointer;
      }
      .title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
      }
      .form-card {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 1.5rem;
        background: var(--surface);
        border: 1px solid var(--border-soft);
        border-radius: 16px;
      }
      .pw-hint {
        margin: -0.5rem 0 0.25rem;
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .toggle-row {
        padding: 0.5rem 0;
      }
      .chk {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        cursor: pointer;
      }
      .section {
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-soft);
      }
      .section-title {
        margin: 0 0 0.35rem;
        font-size: 1rem;
        font-weight: 700;
      }
      .section-hint {
        margin: 0 0 1rem;
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      .role-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .role-pill {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-radius: 10px;
        border: 1px solid var(--border-soft);
        background: rgba(255, 255, 255, 0.02);
        cursor: pointer;
        font-size: 0.85rem;
      }
      .role-type {
        font-size: 0.65rem;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .perm-group {
        margin-bottom: 1.25rem;
      }
      .perm-group-title {
        margin: 0 0 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
      }
      .perm-grid {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .perm-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        cursor: pointer;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class UserEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly rolesApi = inject(RolesService);
  private readonly toast = inject(ToastService);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  userId = signal<string>('');
  /** Ruta `/users/new` — alta vía API, no placeholder. */
  createMode = signal(false);
  isLoading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  tenantRoles = signal<Role[]>([]);
  private readonly permCatalog = signal<{ id: string; label: string; group: string }[]>([]);

  permissionGroups = computed(() => {
    const list = this.permCatalog().filter((p) => p.id !== '*');
    const map = new Map<string, { id: string; label: string; group: string }[]>();
    for (const p of list) {
      const g = p.group || 'General';
      if (!map.has(g)) {
        map.set(g, []);
      }
      map.get(g)!.push(p);
    }
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  });

  draft: UpdateUserDto & {
    email?: string;
    isActive?: boolean;
    password?: string;
    passwordConfirm?: string;
    roleNames: string[];
    extraPermissions: string[];
  } = {
    roleNames: [],
    extraPermissions: [],
  };

  ngOnInit(): void {
    this.createMode.set(this.route.snapshot.data['createMode'] === true);
    this.reload();
  }

  reload(): void {
    if (this.createMode()) {
      this.userId.set('');
      this.error.set(null);
      this.isLoading.set(true);
      forkJoin({
        roles: this.rolesApi.findAll(),
        catalog: this.rolesApi.getPermissionsCatalog(),
      }).subscribe({
        next: ({ roles, catalog }) => {
          this.draft = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            passwordConfirm: '',
            isActive: true,
            roleNames: [],
            extraPermissions: [],
          };
          this.tenantRoles.set(roles);
          this.permCatalog.set(catalog);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar roles o permisos.');
          this.isLoading.set(false);
        },
      });
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Usuario no especificado');
      this.isLoading.set(false);
      return;
    }
    this.userId.set(id);
    this.error.set(null);
    this.isLoading.set(true);
    forkJoin({
      user: this.usersService.findById(id),
      roles: this.rolesApi.findAll(),
      catalog: this.rolesApi.getPermissionsCatalog(),
    }).subscribe({
      next: ({ user, roles, catalog }) => {
        this.applyUser(user);
        this.tenantRoles.set(roles);
        this.permCatalog.set(catalog);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el usuario o los roles.');
        this.isLoading.set(false);
      },
    });
  }

  private applyUser(u: User): void {
    this.draft = {
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      isActive: u.isActive,
      roleNames: [...(u.roles || [])],
      extraPermissions: [...(u.extraPermissions || [])],
    };
  }

  isRoleSelected(name: string): boolean {
    return this.draft.roleNames.includes(name);
  }

  toggleRole(name: string, checked: boolean): void {
    const set = new Set(this.draft.roleNames);
    if (checked) {
      set.add(name);
    } else {
      set.delete(name);
    }
    this.draft.roleNames = Array.from(set);
  }

  toggleExtra(id: string, checked: boolean): void {
    const set = new Set(this.draft.extraPermissions);
    if (checked) {
      set.add(id);
    } else {
      set.delete(id);
    }
    this.draft.extraPermissions = Array.from(set);
  }

  save(): void {
    if (this.createMode()) {
      this.saveCreate();
      return;
    }
    const id = this.userId();
    if (!id) return;
    this.saving.set(true);
    const body: UpdateUserDto = {
      firstName: this.draft.firstName,
      lastName: this.draft.lastName,
      email: this.draft.email,
      isActive: this.draft.isActive,
      roles: this.draft.roleNames,
      extraPermissions: this.draft.extraPermissions,
    };
    this.usersService.update(id, body).subscribe({
      next: () => {
        this.toast.show('Usuario actualizado', 'success');
        void this.router.navigate(['/users']);
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const payload = err.error as { message?: string | string[] } | undefined;
        const m = payload?.message;
        const detail = Array.isArray(m)
          ? m.join(' ')
          : typeof m === 'string'
            ? m
            : err.message;
        this.toast.show(detail || 'No se pudo guardar.', 'error');
        this.saving.set(false);
      },
    });
  }

  private saveCreate(): void {
    const email = (this.draft.email ?? '').trim();
    if (!email) {
      this.toast.show('Indica un correo electrónico.', 'error');
      return;
    }
    const pw = this.draft.password ?? '';
    const pw2 = this.draft.passwordConfirm ?? '';
    if (pw.length < 6) {
      this.toast.show('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (pw !== pw2) {
      this.toast.show('Las contraseñas no coinciden.', 'error');
      return;
    }
    if (this.draft.roleNames.length === 0) {
      this.toast.show('Selecciona al menos un rol del tenant.', 'error');
      return;
    }
    this.saving.set(true);
    const body: CreateUserDto = {
      email,
      password: pw,
      firstName: this.draft.firstName?.trim() || undefined,
      lastName: this.draft.lastName?.trim() || undefined,
      roles: this.draft.roleNames,
      extraPermissions:
        this.draft.extraPermissions.length > 0 ? this.draft.extraPermissions : undefined,
    };
    this.usersService.create(body).subscribe({
      next: (u) => {
        this.toast.show('Usuario creado correctamente.', 'success');
        void this.router.navigate(['/users', u.id]);
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const payload = err.error as { message?: string | string[] } | undefined;
        const m = payload?.message;
        const detail = Array.isArray(m)
          ? m.join(' ')
          : typeof m === 'string'
            ? m
            : err.message;
        this.toast.show(detail || 'No se pudo crear el usuario.', 'error');
        this.saving.set(false);
      },
    });
  }
}
