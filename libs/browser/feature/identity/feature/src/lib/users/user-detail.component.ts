import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiLoaderComponent,
  UiBadgeComponent,
} from '@josanz-erp/shared-ui-kit';
import { UsersService } from '@josanz-erp/identity-data-access';
import { User } from '@josanz-erp/identity-api';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    UiButtonComponent,
    UiLoaderComponent,
    UiBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="user-detail animate-fade-in">
      @if (isLoading()) {
        <div class="loader-wrap">
          <ui-loader message="Cargando usuario..."></ui-loader>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <lucide-icon name="alert-circle" size="48" class="error-icon" aria-hidden="true"></lucide-icon>
          <p>{{ error() }}</p>
          <div class="error-actions">
            <ui-button variant="solid" (clicked)="reload()">Reintentar</ui-button>
            <ui-button variant="ghost" routerLink="/users">Volver a usuarios</ui-button>
          </div>
        </div>
      } @else if (user(); as u) {
        <div class="header-bar">
          <button type="button" class="back-btn" routerLink="/users" title="Volver">
            <lucide-icon name="arrow-left" size="18" aria-hidden="true"></lucide-icon>
          </button>
          <div class="header-text">
            <h1 class="title">{{ fullName(u) }}</h1>
            <p class="meta">{{ u.email }}</p>
          </div>
          <ui-button variant="solid" size="sm" icon="pencil" (clicked)="onEdit()">
            Editar
          </ui-button>
        </div>

        <div class="info-card">
          <div class="row">
            <span class="lbl">Estado</span>
            <ui-badge [variant]="u.isActive ? 'success' : 'secondary'">
              {{ u.isActive ? 'Activo' : 'Inactivo' }}
            </ui-badge>
          </div>
          <div class="row">
            <span class="lbl">Categoría</span>
            <span>{{ (u.category || 'ESTÁNDAR') | uppercase }}</span>
          </div>
          <div class="row">
            <span class="lbl">Roles</span>
            <span>{{ u.roles.length ? u.roles.join(', ') : 'SIN ROL' }}</span>
          </div>
          <div class="row">
            <span class="lbl">ID</span>
            <span class="mono">{{ u.id }}</span>
          </div>
          <div class="row">
            <span class="lbl">Alta</span>
            <span>{{ u.createdAt | date: 'medium' }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .user-detail {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
      }
      .loader-wrap,
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
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
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-soft);
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
        transition: border-color 0.2s, background 0.2s;
      }
      .back-btn:hover {
        border-color: var(--brand-border-soft);
        background: var(--brand-ambient);
      }
      .back-btn:focus-visible {
        outline: 2px solid var(--brand, #6366f1);
        outline-offset: 2px;
      }
      .header-text {
        flex: 1;
        min-width: 0;
      }
      .title {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .meta {
        margin: 0.35rem 0 0;
        font-size: 0.9rem;
        color: var(--text-muted);
      }
      .info-card {
        background: var(--surface);
        border: 1px solid var(--border-soft);
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .lbl {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
      }
      .mono {
        font-family: var(--font-mono, monospace);
        font-size: 0.75rem;
        word-break: break-all;
      }
    `,
  ],
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  user = signal<User | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Usuario no especificado');
      this.isLoading.set(false);
      return;
    }
    this.error.set(null);
    this.isLoading.set(true);
    this.usersService.findById(id).subscribe({
      next: (u) => {
        if (!u) {
          this.error.set('Usuario no encontrado.');
          this.user.set(null);
          this.isLoading.set(false);
          return;
        }
        this.user.set(u);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el usuario.');
        this.isLoading.set(false);
      },
    });
  }

  onEdit(): void {
    const id = this.user()?.id;
    if (id) {
      this.router.navigate(['/users', id, 'edit']);
    }
  }

  fullName(u: User): string {
    return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
  }
}
