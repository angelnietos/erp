import { Component, OnInit, OnDestroy, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { 
  UiButtonComponent, 
  UiFeatureFilterBarComponent, 
  UiLoaderComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiFeatureAccessDeniedComponent,
} from '@josanz-erp/shared-ui-kit';
import { UsersService } from '@josanz-erp/identity-data-access';
import { User } from '@josanz-erp/identity-api';
import { catchError, finalize, map, Observable, of, take } from 'rxjs';
import {
  ThemeService,
  MasterFilterService,
  FilterableService,
  GlobalAuthStore,
  rbacAllows,
  ToastService,
} from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-users-list',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UiFeatureFilterBarComponent,
    UiLoaderComponent,
    UiButtonComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    UiFeatureAccessDeniedComponent,
  ],
  template: `
    @if (!canViewUsers()) {
      <ui-feature-access-denied
        message="Tu rol no incluye permiso para ver o gestionar usuarios."
        permissionHint="users.view o users.manage"
      />
    } @else {
      <div class="feature-page-shell feature-page-shell--fade-in">
        <ui-feature-header
          title="Usuarios"
          subtitle="Gestión de identidades y control de acceso"
          icon="users"
          [actionLabel]="canManageUsers() ? 'Nuevo usuario' : ''"
          (actionClicked)="onHeaderPrimaryAction()"
        ></ui-feature-header>

        @if (loadError() && hasAnyUsers()) {
          <div class="feature-load-error-banner" role="status" aria-live="polite">
            <lucide-icon
              name="alert-circle"
              size="18"
              class="feature-load-error-banner__icon"
            ></lucide-icon>
            <span class="feature-load-error-banner__text">{{ loadError() }}</span>
            <ui-button variant="ghost" size="sm" (clicked)="loadUsers()">Reintentar</ui-button>
          </div>
        }

        <ui-feature-stats>
          <ui-stat-card 
            label="Total Usuarios" 
            [value]="users().length.toString()" 
            icon="users"
            [accent]="true">
          </ui-stat-card>
          <ui-stat-card 
            label="Activos ahora" 
            [value]="activeUsersCount().toString()" 
            icon="zap">
          </ui-stat-card>
          <ui-stat-card 
            label="Roles Definidos" 
            [value]="rolesCount().toString()" 
            icon="shield">
          </ui-stat-card>
          <ui-stat-card
            label="Sistema"
            value="RBAC v2"
            icon="lock"
            [accent]="false"
          ></ui-stat-card>
        </ui-feature-stats>

        <ui-feature-filter-bar
          [appearance]="'feature'"
          [searchVariant]="'glass'"
          placeholder="Buscar usuarios por nombre, email o rol…"
          (searchChange)="onSearch($event)"
        >
          <ui-button
            variant="ghost"
            size="sm"
            icon="sliders-horizontal"
            [attr.title]="'Alternar ordenación entre nombre y correo'"
            (clicked)="toggleSort()"
          >
            Ordenar por
            {{ sortField() === 'name' ? 'nombre' : 'correo' }}
          </ui-button>
        </ui-feature-filter-bar>

        @if (isLoading()) {
          <div class="feature-loader-wrap">
            <ui-loader message="Sincronizando identidades…"></ui-loader>
          </div>
        } @else if (loadError() && !hasAnyUsers()) {
          <div class="feature-error-screen" role="alert">
            <lucide-icon name="wifi-off" size="56" class="feature-error-screen__icon"></lucide-icon>
            <h3>No se pudo cargar la lista</h3>
            <p>
              {{
                loadError() ||
                  'Comprueba la conexión o inténtalo de nuevo en unos segundos.'
              }}
            </p>
            <ui-button variant="solid" (clicked)="loadUsers()">Reintentar</ui-button>
          </div>
        } @else if (!hasAnyUsers()) {
          <div class="feature-empty feature-empty--wide">
            <lucide-icon name="users" size="64" class="feature-empty__icon"></lucide-icon>
            <h3>Sin usuarios</h3>
            <p>
              Aún no hay cuentas en este espacio de trabajo. Cuando se den de alta, aparecerán aquí.
            </p>
          </div>
        } @else if (filterProducesNoResults()) {
          <div class="feature-empty feature-empty--wide">
            <lucide-icon name="search-x" size="64" class="feature-empty__icon"></lucide-icon>
            <h3>Sin resultados</h3>
            <p>Ningún usuario coincide con la búsqueda actual.</p>
            <ui-button variant="ghost" size="sm" (clicked)="clearFiltersAndSearch()">
              Limpiar búsqueda
            </ui-button>
          </div>
        } @else {
          <ui-feature-grid>
            @for (user of filteredUsers(); track user.id) {
              <ui-feature-card
                [name]="(user.firstName || '') + ' ' + (user.lastName || '')"
                [subtitle]="user.email"
                [avatarInitials]="getInitials(user.firstName, user.lastName)"
                [avatarBackground]="getStatusGradient(user.isActive)"
                [status]="user.isActive ? 'active' : 'offline'"
                [badgeLabel]="user.roles[0] || 'SIN ROL'"
                (detailClicked)="onRowClick(user)"
                (editClicked)="onEdit(user)"
                (deleteClicked)="onDelete(user)"
                [footerItems]="[
                  { icon: 'shield', label: (user.category || 'ESTÁNDAR') | uppercase },
                  { icon: 'key', label: user.roles.length + (user.roles.length === 1 ? ' ROL' : ' ROLES') },
                  { 
                    icon: 'lock', 
                    label: user.permissions.includes('*') 
                      ? 'ACCESO TOTAL' 
                      : user.permissions.length + (user.permissions.length === 1 ? ' PERMISO' : ' PERMISOS') 
                  }
                ]"
              >
                 <div footer-extra class="users-extra-actions">
                   <button
                     type="button"
                     class="action-btn warning"
                     (click)="onDeactivate(user); $event.stopPropagation()"
                     [attr.aria-label]="user.isActive ? 'Desactivar usuario' : 'Activar usuario'"
                     [title]="user.isActive ? 'Desactivar' : 'Activar'"
                   >
                     <lucide-icon [name]="user.isActive ? 'user-x' : 'user-check'" size="16" aria-hidden="true"></lucide-icon>
                   </button>
                 </div>
              </ui-feature-card>
            }
          </ui-feature-grid>
        }
      </div>
    }
  `,
  styles: [`
    .users-extra-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text);
    }

    .action-btn.warning:hover {
      color: var(--warning);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit, OnDestroy, FilterableService<User> {
  private readonly usersService = inject(UsersService);
  private readonly themeService = inject(ThemeService);
  private readonly masterFilter = inject(MasterFilterService);
  public readonly authStore = inject(GlobalAuthStore);
  public readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly canViewUsers = rbacAllows(this.authStore, 'users.view', 'users.manage');
  readonly canManageUsers = rbacAllows(this.authStore, 'users.manage');

  currentTheme = this.themeService.currentThemeData;
  users = signal<User[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  readonly hasAnyUsers = computed(() => this.users().length > 0);

  sortField = signal<'name' | 'email'>('name');
  sortDirection = signal<1 | -1>(1);

  activeUsersCount = computed(() => this.users().filter((u: User) => u.isActive).length);
  rolesCount = computed(() => new Set(this.users().flatMap((u: User) => u.roles)).size);

  filteredUsers = computed(() => {
    let list = [...this.users()];
    const t = this.masterFilter.query().trim().toLowerCase();
    if (t) {
      list = list.filter((u: User) =>
        u.email.toLowerCase().includes(t) ||
        (u.firstName ?? '').toLowerCase().includes(t) ||
        (u.lastName ?? '').toLowerCase().includes(t) ||
        u.roles.some((r: string) => r.toLowerCase().includes(t)),
      );
    }
    const field = this.sortField();
    const dir = this.sortDirection();
    list.sort((a, b) => {
      let valA = '';
      let valB = '';
      if (field === 'name') {
        valA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim().toLowerCase();
        valB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim().toLowerCase();
      } else {
        valA = (a.email || '').toLowerCase();
        valB = (b.email || '').toLowerCase();
      }
      return valA.localeCompare(valB, 'es', { sensitivity: 'base' }) * dir;
    });
    return list;
  });

  /** Hay datos cargados pero la búsqueda actual no devuelve filas. */
  readonly filterProducesNoResults = computed(() => {
    if (!this.hasAnyUsers() || this.filteredUsers().length > 0) {
      return false;
    }
    return this.masterFilter.query().trim().length > 0;
  });

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadUsers();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onHeaderPrimaryAction(): void {
    this.toast.show(
      'El alta de usuarios desde esta pantalla aún no está disponible. Usa la API de administración o contacta con soporte.',
      'info',
      5500,
    );
  }

  loadUsers() {
    this.loadError.set(null);
    this.isLoading.set(true);
    this.usersService
      .findAll()
      .pipe(
        take(1),
        catchError(() => {
          this.loadError.set('No se pudo cargar la lista. Comprueba la conexión o vuelve a intentarlo.');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((users) => {
        if (users !== null) {
          this.users.set(users);
          this.loadError.set(null);
        }
      });
  }

  // Implementation of FilterableService<User>
  filter(query: string): Observable<User[]> {
    return this.usersService.findAll().pipe(
      map(users => {
        const q = query.toLowerCase().trim();
        return users.filter(u => 
          u.email.toLowerCase().includes(q) ||
          (`${u.firstName} ${u.lastName}`).toLowerCase().includes(q)
        );
      })
    );
  }

  onSearch(term: string) {
    this.masterFilter.search(term);
  }

  clearFiltersAndSearch(): void {
    this.masterFilter.search('');
  }

  toggleSort() {
    if (this.sortField() === 'name') {
      this.sortField.set('email');
    } else {
      this.sortField.set('name');
    }
  }

  onRowClick(user: User) {
    this.router.navigate(['/users', user.id]);
  }

  onEdit(user: User) {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  onDelete(user: User) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.email}?`)) {
      this.usersService.delete(user.id).subscribe({
        next: () => this.users.update((list) => list.filter((u) => u.id !== user.id)),
      });
    }
  }

  onDeactivate(user: User) {
    const newStatus = !user.isActive;
    this.usersService.update(user.id, { isActive: newStatus }).subscribe({
      next: () => {
        this.users.update(list => list.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u));
      }
    });
  }

  getInitials(first: string | undefined, last: string | undefined): string {
    return ((first?.charAt(0) || '') + (last?.charAt(0) || '')).toUpperCase() || 'U';
  }

  getStatusGradient(isActive: boolean): string {
    return isActive 
      ? 'linear-gradient(135deg, #10b981, #059669)' 
      : 'linear-gradient(135deg, #6b7280, #374151)';
  }
}
