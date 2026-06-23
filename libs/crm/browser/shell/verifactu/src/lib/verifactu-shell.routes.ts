import { Route } from '@angular/router';
import {
  VerifactuCredentialsPageComponent,
  VerifactuDashboardComponent,
  VerifactuIntegrationPageComponent,
  VerifactuLogsPageComponent,
  VerifactuOverviewPageComponent,
  VerifactuQueuePageComponent,
  VerifactuSeriesPageComponent,
} from '@generic-crm/verifactu-feature';

export const verifactuShellRoutes: Route[] = [
  {
    path: '',
    component: VerifactuDashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        component: VerifactuOverviewPageComponent,
        title: 'Verifactu · Resumen',
      },
      {
        path: 'queue',
        component: VerifactuQueuePageComponent,
        title: 'Verifactu · Cola AEAT',
      },
      {
        path: 'series',
        component: VerifactuSeriesPageComponent,
        title: 'Verifactu · Series',
      },
      {
        path: 'logs',
        component: VerifactuLogsPageComponent,
        title: 'Verifactu · Historial',
      },
      {
        path: 'credentials',
        component: VerifactuCredentialsPageComponent,
        title: 'Verifactu · Certificado AEAT',
      },
      {
        path: 'integration',
        component: VerifactuIntegrationPageComponent,
        title: 'Verifactu · Integración ERP',
      },
    ],
  },
];
