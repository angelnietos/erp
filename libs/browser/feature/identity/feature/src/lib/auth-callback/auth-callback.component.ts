import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { clearPkceSession, readPkceSession } from '@josanz-erp/shared-auth-keycloak';
import { AuthStore } from '@josanz-erp/identity-data-access';

@Component({
  selector: 'lib-auth-callback',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="auth-callback" role="status" aria-live="polite">
      @if (error()) {
        <p class="auth-callback__error">{{ error() }}</p>
        <a routerLink="/auth/login">Volver al login</a>
      } @else {
        <p>Completando inicio de sesión…</p>
      }
    </div>
  `,
  styles: `
    .auth-callback {
      min-height: 40vh;
      display: grid;
      place-content: center;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
      font-family: system-ui, sans-serif;
    }
    .auth-callback__error {
      color: #b91c1c;
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(AuthStore);

  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const err = this.store.error();
      if (err && !this.store.loading()) {
        this.error.set(err);
      }
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const oidcError = params.get('error');
    if (oidcError) {
      clearPkceSession();
      this.error.set(params.get('error_description') ?? oidcError);
      return;
    }

    const code = params.get('code')?.trim() ?? '';
    const state = params.get('state')?.trim() ?? '';
    const stored = readPkceSession();

    if (!code || !state || !stored || stored.state !== state) {
      clearPkceSession();
      this.error.set('Enlace de retorno inválido o caducado. Vuelve a iniciar sesión.');
      return;
    }

    this.store.loginWithPkceCallback({ code, tenantSlug: stored.tenantSlug });
  }
}
