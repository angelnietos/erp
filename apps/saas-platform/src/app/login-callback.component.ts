import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { KeycloakAuthService } from './keycloak-auth.service';
import { setPlatformToken } from './platform-auth.interceptor';

@Component({
  standalone: true,
  selector: 'app-login-callback',
  template: `
    <div class="shell" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <p>Completando inicio de sesión con Keycloak…</p>
    </div>
  `,
  styles: [
    `
      :host {
        display: grid;
        place-items: center;
        min-height: 100vh;
        font-family: var(--sp-font-sans);
        color: var(--sp-text);
      }
      .shell {
        text-align: center;
        padding: 2rem;
      }
      .spinner {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 2px solid rgba(255, 255, 255, 0.15);
        border-top-color: var(--sp-accent-secondary);
        border-radius: 50%;
        animation: spin 0.85s linear infinite;
        margin-bottom: 1rem;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoginCallbackComponent {
  private readonly auth = inject(KeycloakAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    const code = this.route.snapshot.queryParamMap.get('code')?.trim() ?? '';
    const state = this.route.snapshot.queryParamMap.get('state')?.trim() ?? '';
    const kcError =
      this.route.snapshot.queryParamMap.get('error_description') ??
      this.route.snapshot.queryParamMap.get('error');

    if (kcError) {
      this.fallbackToLocal(String(kcError));
      return;
    }
    if (!code || !state) {
      this.fallbackToLocal('Respuesta de Keycloak incompleta.');
      return;
    }

    this.auth
      .completePlatformPkceCallback(code, state)
      .pipe(finalize(() => undefined))
      .subscribe({
        next: (result) => {
          if (!this.auth.isBffMode() && result.accessToken) {
            setPlatformToken(result.accessToken);
          }
          void this.router.navigateByUrl('/tenants');
        },
        error: (e: unknown) => {
          const message =
            e instanceof Error ? e.message : 'No se pudo completar el login.';
          this.fallbackToLocal(message);
        },
      });
  }

  private fallbackToLocal(message: string): void {
    void this.router.navigate(['/login'], {
      queryParams: {
        local: '1',
        reason: 'kc_error',
        msg: message.slice(0, 240),
      },
      replaceUrl: true,
    });
  }
}
