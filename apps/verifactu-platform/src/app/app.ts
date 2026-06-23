import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { IdentityAuthService } from '@generic-crm/identity-data-access';
import { SessionTokenStorageService } from '@generic-crm/shared-browser-data-access';
import { environment } from '../environments/environment';
import {
  clearVerifactuPkceRedirectPending,
  clearVerifactuPkceSession,
} from './auth/pkce.util';
import { VerifactuKeycloakAuthService } from './auth/verifactu-keycloak-auth.service';

@Component({
  imports: [RouterModule, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = 'Generic CRM';
  protected readonly session = inject(SessionTokenStorageService);
  private readonly auth = inject(IdentityAuthService);
  private readonly keycloak = inject(VerifactuKeycloakAuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    clearVerifactuPkceSession();
    clearVerifactuPkceRedirectPending();

    const tenantSlug = environment.defaultTenantSlug;

    if (this.keycloak.canUseKeycloak(tenantSlug)) {
      this.keycloak.endSessionLogout(tenantSlug);
      return;
    }

    void this.router.navigate(['/login'], {
      queryParams: { reason: 'logout' },
      replaceUrl: true,
    });
  }
}
