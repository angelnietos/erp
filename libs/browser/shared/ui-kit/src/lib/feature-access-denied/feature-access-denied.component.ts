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
      <lucide-icon name="shield-off" class="denied-icon"></lucide-icon>
      <h2 class="title">{{ title() }}</h2>
      <p class="text">{{ message() }}</p>
      @if (permissionHint()) {
        <p class="hint">Permiso requerido: <code>{{ permissionHint() }}</code></p>
      }
      <ui-button variant="primary" (clicked)="goHome()">{{ backLabel() }}</ui-button>
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
        gap: 1rem;
        padding: 2rem;
        text-align: center;
        max-width: 420px;
        margin: 0 auto;
      }
      .denied-icon {
        width: 56px;
        height: 56px;
        color: var(--error, #ef4444);
        opacity: 0.85;
      }
      .title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
      }
      .text {
        margin: 0;
        color: var(--text-muted, rgba(255, 255, 255, 0.55));
        line-height: 1.5;
      }
      .hint {
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-muted, rgba(255, 255, 255, 0.45));
        font-style: italic;
      }
      code {
        font-size: 0.85em;
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
    void this.router.navigate(['/']);
  }
}
