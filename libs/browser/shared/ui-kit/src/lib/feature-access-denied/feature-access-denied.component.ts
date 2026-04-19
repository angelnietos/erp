import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent } from '../button/button.component';

@Component({
  selector: 'ui-feature-access-denied',
  standalone: true,
  imports: [LucideAngularModule, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="access-denied">
      <div class="access-denied__panel">
        <lucide-icon name="shield-off" class="denied-icon" aria-hidden="true"></lucide-icon>
        <h2 class="title">{{ title() }}</h2>
        <p class="text">{{ message() }}</p>
        @if (permissionHint()) {
          <p class="hint">
            Permiso necesario: <code>{{ permissionHint() }}</code>
          </p>
        }
        <ui-button variant="primary" (clicked)="goHome()">{{ backLabel() }}</ui-button>
      </div>
    </div>
  `,
  styles: [
    `
      .access-denied {
        min-height: 50vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1.25rem;
      }
      .access-denied__panel {
        width: 100%;
        max-width: 440px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2rem 1.75rem;
        text-align: center;
        border-radius: var(--radius-lg, 20px);
        background: var(--surface, rgba(18, 20, 28, 0.76));
        border: 1px solid var(--border-soft, rgba(255, 255, 255, 0.08));
        box-shadow: var(--shadow-md, 0 12px 32px rgba(0, 0, 0, 0.35));
      }
      .denied-icon {
        width: 52px;
        height: 52px;
        color: var(--error, #ef4444);
        opacity: 0.9;
      }
      .title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-primary);
      }
      .text {
        margin: 0;
        color: var(--text-muted, rgba(255, 255, 255, 0.55));
        line-height: 1.55;
        font-size: 0.95rem;
      }
      .hint {
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-muted, rgba(255, 255, 255, 0.45));
        line-height: 1.45;
      }
      code {
        font-size: 0.85em;
        padding: 0.15em 0.4em;
        border-radius: 6px;
        background: color-mix(in srgb, var(--text-primary) 6%, transparent);
      }

      :host-context(html[data-erp-tenant='babooni']) .access-denied__panel {
        background: var(--theme-surface, #ffffff);
        border: 1px solid var(--border-soft, #d1d1d1);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
      }
    `,
  ],
})
export class UiFeatureAccessDeniedComponent {
  private readonly router = inject(Router);

  readonly title = input<string>('Acceso restringido');
  readonly message = input<string>(
    'Tu rol no incluye permiso para usar esta área de la aplicación.',
  );
  /** Clave técnica mostrada como ayuda (p. ej. clients.view). */
  readonly permissionHint = input<string | undefined>(undefined);
  readonly backLabel = input<string>('Volver al inicio');

  goHome(): void {
    void this.router.navigate(['/dashboard']);
  }
}
