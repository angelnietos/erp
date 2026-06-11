import { NavMenuItem } from '@josanz-erp/shared-ui-kit';

/** Menú principal del ERP — compartido entre sidebar Josanz y Babooni. */
export const ERP_MAIN_NAV_ITEMS: NavMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'layout-dashboard',
    route: '/',
  },
  { id: 'clients', label: 'Clientes', icon: 'users', route: '/clients', permission: 'clients.view' },
  {
    id: 'projects',
    label: 'Proyectos',
    icon: 'file-text',
    route: '/projects',
    permission: 'projects.view'
  },
  { id: 'events', label: 'Eventos', icon: 'calendar', route: '/events', permission: 'events.view' },
  {
    id: 'identity',
    label: 'Identidad',
    icon: 'id-card',
    route: '/users',
    permission: 'users.view'
  },
  {
    id: 'availability',
    label: 'Disponibilidad',
    icon: 'clock',
    route: '/users/availability',
    permission: 'availability.view'
  },
  { id: 'services', label: 'Servicios', icon: 'wrench', route: '/services', permission: 'services.view' },
  { id: 'reports', label: 'Reportes', icon: 'ChartPie', route: '/reports', permission: 'reports.view' },
  { id: 'audit', label: 'Auditoría', icon: 'shield-check', route: '/audit', permission: 'audit.view' },
  {
    id: 'inventory',
    label: 'Inventario',
    icon: 'package',
    route: '/inventory',
    permission: 'inventory.view'
  },
  {
    id: 'budgets',
    label: 'Presupuestos',
    icon: 'receipt',
    route: '/budgets',
    permission: 'budgets.view'
  },
  { id: 'delivery', label: 'Albaranes', icon: 'truck', route: '/delivery', permission: 'delivery.view' },
  { id: 'fleet', label: 'Flota', icon: 'car', route: '/fleet', permission: 'fleet.view' },
  { id: 'rentals', label: 'Alquileres', icon: 'key', route: '/rentals', permission: 'rentals.view' },
  { id: 'billing', label: 'Facturación', icon: 'history', route: '/billing', permission: 'billing.view' },
  {
    id: 'verifactu',
    label: 'VeriFactu',
    icon: 'file-check',
    route: '/verifactu',
    permission: 'verifactu.view'
  },
  {
    id: 'ai-insights',
    label: 'AI Insights',
    icon: 'cpu',
    route: '/ai-insights',
  },
];
