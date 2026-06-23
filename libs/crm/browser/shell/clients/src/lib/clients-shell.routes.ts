import { Route } from '@angular/router';
import { ClientsHomePageComponent } from '@generic-crm/clients-feature';

export const clientsShellRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: ClientsHomePageComponent,
    title: 'Verifactu · Clientes',
  },
];
