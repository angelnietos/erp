import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { IdentityAuthService } from '@generic-crm/identity-data-access';
import { SessionTokenStorageService } from '@generic-crm/shared-browser-data-access';

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
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
