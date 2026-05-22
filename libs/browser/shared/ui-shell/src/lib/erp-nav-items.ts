import { NavMenuItem } from '@josanz-erp/shared-ui-kit';

/** Menú principal del ERP — compartido entre sidebar Josanz y Babooni. */
export const ERP_MAIN_NAV_ITEMS: NavMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'layout-dashboard',
    route: '/',
  },
  { id: 'clients', label: 'Clientes', icon: 'users', route: '/clients' },
  {
    id: 'projects',
    label: 'Proyectos',
    icon: 'file-text',
    route: '/projects',
  },
  { id: 'events', label: 'Eventos', icon: 'calendar', route: '/events' },
  {
    id: 'identity',
    label: 'Identidad',
    icon: 'id-card',
    route: '/users',
  },
  {
    id: 'availability',
    label: 'Disponibilidad',
    icon: 'clock',
    route: '/users/availability',
  },
  { id: 'services', label: 'Servicios', icon: 'wrench', route: '/services' },
  { id: 'reports', label: 'Reportes', icon: 'ChartPie', route: '/reports' },
  { id: 'audit', label: 'Auditoría', icon: 'shield-check', route: '/audit' },
  {
    id: 'inventory',
    label: 'Inventario',
    icon: 'package',
    route: '/inventory',
  },
  {
    id: 'budgets',
    label: 'Presupuestos',
    icon: 'receipt',
    route: '/budgets',
  },
  { id: 'delivery', label: 'Albaranes', icon: 'truck', route: '/delivery' },
  { id: 'fleet', label: 'Flota', icon: 'car', route: '/fleet' },
  { id: 'rentals', label: 'Alquileres', icon: 'key', route: '/rentals' },
  { id: 'billing', label: 'Facturación', icon: 'history', route: '/billing' },
  {
    id: 'verifactu',
    label: 'VeriFactu',
    icon: 'file-check',
    route: '/verifactu',
  },
  {
    id: 'ai-insights',
    label: 'AI Insights',
    icon: 'cpu',
    route: '/ai-insights',
  },
];
