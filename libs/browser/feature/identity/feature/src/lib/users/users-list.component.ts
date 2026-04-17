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
import { map, Observable, of } from 'rxjs';
import {
  ThemeService,
  MasterFilterService,
  FilterableService,
  GlobalAuthStore,
  rbacAllows,
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
      <div class="users-container">
        <ui-feature-header
          title="Usuarios"
          subtitle="Gestión de identidades y control de acceso"
          icon="users"
          actionLabel="NUEVO USUARIO"
        ></ui-feature-header>

        <ui-feature-stats>
          <ui-stat-card 
            label="Total Usuarios" 
            [value]="users().length.toString()" 
            icon="users"
            [accent]="true">
          </ui-stat-card>
          <ui-stat-card 
            label="Activos Ahora" 
            [value]="activeUsersCount().toString()" 
            icon="zap" 
            [trend]="2">
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
          placeholder="BUSCAR POR NOMBRE, EMAIL O ROL..."
          (searchChange)="onSearch($event)"
        >
          <ui-button
            variant="ghost"
            size="sm"
            [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
            (clicked)="toggleSort()"
          >
            ORDENAR:
            {{ sortField() === 'name' ? 'NOMBRE' : 'EMAIL' }}
          </ui-button>
        </ui-feature-filter-bar>

        @if (isLoading()) {
          <div class="loader-container">
            <ui-loader message="Sincronizando identidades..."></ui-loader>
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
                   <button class="action-btn warning" (click)="onDeactivate(user); $event.stopPropagation()" [title]="user.isActive ? 'Desactivar' : 'Activar'">
                     <lucide-icon [name]="user.isActive ? 'user-x' : 'user-check'" size="16"></lucide-icon>
                   </button>
                 </div>
              </ui-feature-card>
            } @empty {
              <div class="empty-state">
                <lucide-icon name="users" size="64" class="empty-icon"></lucide-icon>
                <h3>Sin resultados</h3>
                <p>No se encontraron usuarios que coincidan con la búsqueda.</p>
              </div>
            }
          </ui-feature-grid>
        }
      </div>
    }
  `,
  styles: [`
    .users-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 2rem;
      animation: fadeIn 0.4s ease-out;
    }

    .loader-container {
      display: flex;
      justify-content: center;
      padding: 5rem;
    }

    .access-denied-container {
      height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .denied-card {
      max-width: 400px;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-soft);
      border-radius: 24px;
      backdrop-filter: blur(20px);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .denied-icon {
      width: 64px;
      height: 64px;
      color: var(--error);
      opacity: 0.8;
      margin-bottom: 1rem;
    }

    .hint {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-style: italic;
    }

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

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5rem;
      text-align: center;
      background: var(--surface);
      border-radius: 20px;
      border: 2px dashed var(--border-soft);
    }
    .empty-icon { color: var(--text-muted); opacity: 0.3; margin-bottom: 1.5rem; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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

  readonly canViewUsers = rbacAllows(this.authStore, 'users.view', 'users.manage');

  currentTheme = this.themeService.currentThemeData;
  users = signal<User[]>([]);
  isLoading = signal(true);

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

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadUsers();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  private loadUsers() {
    this.isLoading.set(true);
    this.usersService.findAll().subscribe((users) => {
      this.users.set(users);
      this.isLoading.set(false);
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
