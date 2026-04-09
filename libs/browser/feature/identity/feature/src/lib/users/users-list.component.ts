import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent, UiCardComponent, UiSearchComponent, UiLoaderComponent } from '@josanz-erp/shared-ui-kit';
import { UsersService } from '@josanz-erp/identity-data-access';
import { User } from '@josanz-erp/identity-api';
import { Observable, of } from 'rxjs';
import { ThemeService, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-users-list',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UiCardComponent,
    UiSearchComponent,
    UiLoaderComponent,
    UiButtonComponent,
  ],
  template: `
    <div class="page-container animate-slide-up">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-main">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
            Directorio de Usuarios
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">GESTIÓN DE ACCESOS</span>
            <span class="separator">/</span>
            <span>IDENTIDAD Y ROLES</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-button variant="glass" size="md" icon="user-plus">
            NUEVO USUARIO
          </ui-button>
        </div>
      </header>

      <div class="navigation-bar ui-glass-panel">
        <ui-search 
          variant="filled"
          placeholder="BUSCAR USUARIO POR NOMBRE, EMAIL O ROL..." 
          (searchChange)="onSearch($event)"
          class="flex-1 max-w-md"
        ></ui-search>
      </div>

      <ui-card variant="glass" class="users-card">
        <div class="users-list">
          <div class="users-header">
            <h3>Usuarios del Sistema</h3>
            <span class="users-count"
              >{{ filteredUsers().length }} usuarios</span
            >
          </div>

          @if (isLoading()) {
            <div class="loading-state">
              <ui-loader message="SINCRONIZANDO IDENTIDADES..."></ui-loader>
            </div>
          } @else {
            <div class="users-table">
              <div class="table-header">
                <div class="col-email">Email</div>
                <div class="col-name">Nombre</div>
                <div class="col-category">Categoría</div>
                <div class="col-roles">Roles</div>
                <div class="col-status">Estado</div>
                <div class="col-actions">Acciones</div>
              </div>

              <div class="table-body">
                @for (user of filteredUsers(); track user.id) {
                  <div class="table-row">
                    <div class="col-email">{{ user.email }}</div>
                    <div class="col-name">
                      {{ user.firstName || '' }} {{ user.lastName || '' }}
                    </div>
                    <div class="col-category">{{ user.category || '-' }}</div>
                    <div class="col-roles">
                      @for (role of user.roles; track role) {
                        <span class="role-badge" [style.background]="currentTheme().primary">{{ role }}</span>
                      }
                    </div>
                    <div class="col-status">
                      <span
                        class="status-badge"
                        [class.active]="user.isActive"
                        [class.inactive]="!user.isActive"
                      >
                        {{ user.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                    <div class="col-actions">
                      <ui-button variant="ghost" size="sm" icon="pencil">Editar</ui-button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </ui-card>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 100%;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 1.25rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--border-soft);
      }

      .page-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: #fff;
        margin: 0 0 0.25rem 0;
        letter-spacing: -0.02em;
        font-family: var(--font-main);
        line-height: 1.15;
      }

      .breadcrumb {
        display: flex;
        gap: 6px;
        font-size: 0.55rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--text-muted);
      }
      .breadcrumb .active {
        color: var(--brand);
      }
      .breadcrumb .separator {
        opacity: 0.3;
      }

      .navigation-bar { 
        display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 0.75rem 1rem; border-radius: 12px;
        background: rgba(15, 15, 15, 0.4); border: 1px solid rgba(255,255,255,0.05);
      }

      .flex-1 { flex: 1; }
      .max-w-md { max-width: 28rem; }

      .glow-text { 
        font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; 
        letter-spacing: 0.05em; font-family: var(--font-main);
      }

      .users-card {
        padding: 1.5rem;
      }

      .users-list {
        width: 100%;
      }

      .users-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .users-header h3 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }

      .users-count {
        font-size: 0.875rem;
        color: var(--text-muted);
        font-weight: 500;
      }

      .users-table {
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        overflow: hidden;
        background: var(--surface);
      }

      .table-header {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1fr;
        gap: 1rem;
        padding: 1rem 1.5rem;
        background: var(--surface-hover);
        border-bottom: 1px solid var(--border-soft);
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .table-body {
        max-height: 600px;
        overflow-y: auto;
      }

      .table-row {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1fr;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-subtle);
        align-items: center;
        transition: background-color 0.2s ease;
      }

      .table-row:hover {
        background: var(--surface-hover);
      }

      .col-email {
        font-weight: 500;
        color: var(--text-primary);
      }

      .col-name {
        color: var(--text-primary);
      }

      .col-category {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .col-roles {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      .role-badge {
        background: var(--brand);
        color: white;
        padding: 0.125rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .col-status .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 16px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .status-badge.active {
        background: var(--success);
        color: white;
      }

      .status-badge.inactive {
        background: var(--error);
        color: white;
      }

      .col-actions {
        display: flex;
        gap: 0.5rem;
      }

      .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 3rem;
        color: var(--text-muted);
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit, OnDestroy, FilterableService<User> {
  private readonly usersService = inject(UsersService);
  private readonly themeService = inject(ThemeService);
  private readonly masterFilter = inject(MasterFilterService);

  currentTheme = this.themeService.currentThemeData;
  users = signal<User[]>([]);
  isLoading = signal(true);
  filteredUsers = computed(() => {
    const list = this.users();
    const t = this.masterFilter.query().trim().toLowerCase();
    if (!t) return list;
    return list.filter(u => 
      u.email.toLowerCase().includes(t) || 
      (u.firstName ?? '').toLowerCase().includes(t) || 
      (u.lastName ?? '').toLowerCase().includes(t) ||
      u.roles.some(r => r.toLowerCase().includes(t))
    );
  });

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadUsers();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onSearch(term: string) {
    this.masterFilter.search(term);
  }

  filter(query: string): Observable<User[]> {
    const term = query.toLowerCase();
    const matches = this.users().filter(u => 
      u.email.toLowerCase().includes(term) || 
      (u.firstName ?? '').toLowerCase().includes(term) || 
      (u.lastName ?? '').toLowerCase().includes(term)
    );
    return of(matches);
  }

  private loadUsers() {
    this.isLoading.set(true);
    this.usersService.findAll().subscribe({
      next: (list) => {
        this.users.set(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
