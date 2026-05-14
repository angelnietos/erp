import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  JOSANZ_FIGMA_DASHBOARD,
  JOSANZ_FIGMA_SHELL,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';

/**
 * Panel de inicio alineado con `Dashboard.svg` (1440×1364): KPIs, tarjetas 8px / #E0E0E0,
 * rejilla 733+515 y accesos a módulos.
 */
@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './josanz-dashboard-inicio.component.html',
})
export class JosanzDashboardInicioComponent {
  readonly theme = inject(JosanzThemeService);
  readonly shell = JOSANZ_FIGMA_SHELL;
  readonly dash = JOSANZ_FIGMA_DASHBOARD;

  period: 'mes' | 'trim' | 'año' = 'mes';

  readonly chartBars = [36, 52, 44, 68, 56, 78, 62, 48, 72, 58, 82, 64];

  readonly kpis = [
    { label: 'Facturación (mes)', value: '128.420 €', delta: '+12,4 % vs. mes anterior', up: true },
    { label: 'Presupuestos activos', value: '37', delta: '5 pendientes de respuesta', up: false },
    { label: 'Albaranes semana', value: '24', delta: '+3 respecto a la semana pasada', up: true },
  ] as const;

  readonly tasks = [
    { abbr: 'PR', title: 'Revisar presupuesto ACME', meta: 'Comercial · prioridad alta' },
    { abbr: 'AL', title: 'Confirmar entrega material', meta: 'Logística · hoy 17:00' },
    { abbr: 'ST', title: 'Ajuste inventario almacén norte', meta: 'Stock · bloqueante' },
    { abbr: 'CL', title: 'Actualizar datos fiscales', meta: 'Clientes · vence mañana' },
    { abbr: 'US', title: 'Alta usuario temporal', meta: 'Usuarios · soporte' },
  ] as const;

  readonly movements = [
    { concept: 'Factura F-240118', amount: '2.180 €' },
    { concept: 'Abono cliente BETA', amount: '−420 €' },
    { concept: 'Presupuesto P-889', amount: '—' },
    { concept: 'Albarán A-5521', amount: '890 €' },
  ] as const;

  readonly agenda = [
    { time: '09:30', title: 'Revisión pipeline comercial', place: 'Sala 1 · online' },
    { time: '11:00', title: 'Entrega audiovisual', place: 'Cliente · remoto' },
    { time: '16:15', title: 'Cierre de mes contable', place: 'Administración' },
  ] as const;

  readonly links = [
    { path: '/clients', label: 'Clientes', hint: 'Cartera y datos fiscales' },
    { path: '/users', label: 'Usuarios', hint: 'Accesos del sistema' },
    { path: '/delivery-notes', label: 'Albaranes', hint: 'Entregas y logística' },
    { path: '/budgets', label: 'Presupuestos', hint: 'Ofertas y propuestas' },
    { path: '/stock', label: 'Stock', hint: 'Productos y almacenes' },
  ] as const;
}
