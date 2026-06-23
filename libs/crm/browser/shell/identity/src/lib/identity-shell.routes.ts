import { Route } from '@angular/router';
import { IdentityHomePageComponent } from '@generic-crm/identity-feature';

export const identityShellRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: IdentityHomePageComponent,
    title: 'Identidad · Generic CRM',
  },
];
