import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppLayoutComponent } from '@josanz-erp/shared-ui-shell';
import { AuthStore } from '@josanz-erp/identity-data-access';

@Component({
  selector: 'josanz-main-app-shell',
  standalone: true,
  imports: [RouterModule, AppLayoutComponent],
  template: `
    <josanz-app-layout (logoutClick)="auth.logout()">
      <router-outlet></router-outlet>
    </josanz-app-layout>
  `,
})
export class MainAppShellComponent {
  readonly auth = inject(AuthStore);
}
