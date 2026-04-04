import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent, UiCardComponent } from '@josanz-erp/shared-ui-kit';
import { UsersService } from '@josanz-erp/identity-data-access';
import { User } from '@josanz-erp/identity-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'lib-users-list',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UiButtonComponent,
    UiCardComponent,
  ],
  template: `
    <div class="page-container animate-slide-up">
      <header class="page-header">
        <div class="header-main">
          <h1 class="page-title text-uppercase">Directorio de Usuarios</h1>
          <div class="breadcrumb">
            <span class="active">GESTIÓN DE ACCESOS</span>
            <span class="separator">/</span>
            <span>IDENTIDAD Y ROLES</span>
          </div>
        </div>
        <ui-josanz-button variant="primary" size="md" icon="user-plus">
          NUEVO USUARIO
        </ui-josanz-button>
      </header>

      <ui-josanz-card variant="glass" class="users-card">
        <div class="users-list">
          <div class="users-header">
            <h3>Usuarios del Sistema</h3>
            <span class="users-count"
              >{{ (users$ | async)?.length || 0 }} usuarios</span
            >
          </div>

          <div
            class="users-table"
            *ngIf="users$ | async as users; else loading"
          >
            <div class="table-header">
              <div class="col-email">Email</div>
              <div class="col-name">Nombre</div>
              <div class="col-category">Categoría</div>
              <div class="col-roles">Roles</div>
              <div class="col-status">Estado</div>
              <div class="col-actions">Acciones</div>
            </div>

            <div class="table-body">
              <div class="table-row" *ngFor="let user of users">
                <div class="col-email">{{ user.email }}</div>
                <div class="col-name">
                  {{ user.firstName || '' }} {{ user.lastName || '' }}
                </div>
                <div class="col-category">{{ user.category || '-' }}</div>
                <div class="col-roles">
                  <span class="role-badge" *ngFor="let role of user.roles">{{
                    role
                  }}</span>
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
                  <ui-josanz-button variant="ghost" size="sm" icon="edit"
                    >Editar</ui-josanz-button
                  >
                </div>
              </div>
            </div>
          </div>

          <ng-template #loading>
            <div class="loading-state">
              <lucide-icon
                name="loader"
                size="24"
                class="animate-spin"
              ></lucide-icon>
              <span>Cargando usuarios...</span>
            </div>
          </ng-template>
        </div>
      </ui-josanz-card>
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
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  users$!: Observable<User[]>;

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.users$ = this.usersService.findAll();
  }
}
