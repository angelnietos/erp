import {
  Component,
  OnInit,
  inject,
  signal,
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
import { UsersService } from '@josanz-erp/identity-data-access';
import { User, UpdateUserDto } from '@josanz-erp/identity-api';
import { ThemeService, PluginStore, ToastService } from '@josanz-erp/shared-data-access';

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
          <ui-loader message="Cargando usuario..."></ui-loader>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
          <ui-button variant="ghost" routerLink="/users">Volver</ui-button>
        </div>
      } @else {
        <div class="header-bar">
          <button type="button" class="back-btn" [routerLink]="['/users', userId()]">
            <lucide-icon name="arrow-left" size="18"></lucide-icon>
          </button>
          <h1 class="title">Editar usuario</h1>
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
          <div class="toggle-row">
            <label class="chk">
              <input type="checkbox" [(ngModel)]="draft.isActive" name="isActive" />
              <span>Usuario activo</span>
            </label>
          </div>

          <div class="actions">
            <ui-button type="button" variant="ghost" routerLink="/users">Cancelar</ui-button>
            <ui-button type="submit" variant="solid" icon="save" [disabled]="saving()">
              {{ saving() ? 'Guardando…' : 'Guardar' }}
            </ui-button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .user-edit {
        max-width: 560px;
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
  private readonly toast = inject(ToastService);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  userId = signal<string>('');
  isLoading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  draft: UpdateUserDto & { email?: string; isActive?: boolean } = {};

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Usuario no especificado');
      this.isLoading.set(false);
      return;
    }
    this.userId.set(id);
    this.usersService.findById(id).subscribe({
      next: (u: User) => {
        this.draft = {
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          isActive: u.isActive,
        };
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el usuario.');
        this.isLoading.set(false);
      },
    });
  }

  save(): void {
    const id = this.userId();
    if (!id) return;
    this.saving.set(true);
    const body: UpdateUserDto = {
      firstName: this.draft.firstName,
      lastName: this.draft.lastName,
      email: this.draft.email,
      isActive: this.draft.isActive,
    };
    this.usersService.update(id, body).subscribe({
      next: () => {
        this.toast.show('Usuario actualizado', 'success');
        this.router.navigate(['/users', id]);
        this.saving.set(false);
      },
      error: () => {
        this.toast.show('No se pudo guardar.', 'error');
        this.saving.set(false);
      },
    });
  }
}
