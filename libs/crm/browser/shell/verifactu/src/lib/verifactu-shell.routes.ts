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
        title: 'Verifactu · Resumen · Generic CRM',
      },
      {
        path: 'queue',
        component: VerifactuQueuePageComponent,
        title: 'Verifactu · Cola · Generic CRM',
      },
      {
        path: 'series',
        component: VerifactuSeriesPageComponent,
        title: 'Verifactu · Series · Generic CRM',
      },
      {
        path: 'logs',
        component: VerifactuLogsPageComponent,
        title: 'Verifactu · Historial · Generic CRM',
      },
      {
        path: 'credentials',
        component: VerifactuCredentialsPageComponent,
        title: 'Verifactu · Certificado AEAT · Generic CRM',
      },
      {
        path: 'integration',
        component: VerifactuIntegrationPageComponent,
        title: 'Verifactu · Integración · Generic CRM',
      },
    ],
  },
];
