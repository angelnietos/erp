import { Route } from '@angular/router';
import {
  VerifactuCredentialsPageComponent,
  VerifactuDashboardComponent,
  VerifactuIntegrationPageComponent,
  VerifactuInvoicesPageComponent,
  VerifactuInvoiceDetailPageComponent,
  VerifactuLogsPageComponent,
  VerifactuChainPageComponent,
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
        path: 'chain',
        component: VerifactuChainPageComponent,
        title: 'Verifactu · Cadena fiscal',
      },
      {
        path: 'invoices',
        component: VerifactuInvoicesPageComponent,
        title: 'Verifactu · Facturas',
      },
      {
        path: 'invoices/:invoiceId',
        component: VerifactuInvoiceDetailPageComponent,
        title: 'Verifactu · Ficha factura',
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
