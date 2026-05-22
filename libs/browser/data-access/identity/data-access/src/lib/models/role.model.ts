import { RoleType } from '@josanz-erp/identity-core';

export interface Role {
  id: string;
  name: string;
  description?: string;
  type: RoleType;
  permissions: string[];
}

export interface Permission {
  id: string;
  label: string;
  category: string;
}

export const PERMISSIONS_CATALOG: Permission[] = [
  // Sistema
  { id: '*', label: 'Acceso Total (SuperAdmin)', category: 'Sistema' },
  { id: 'dashboard.view', label: 'Ver Dashboard', category: 'General' },

  // Identity
  { id: 'users.view', label: 'Ver Usuarios', category: 'Identidad' },
  { id: 'users.manage', label: 'Gestionar Usuarios', category: 'Identidad' },
  { id: 'roles.manage', label: 'Gestionar Roles', category: 'Identidad' },
  { id: 'tenants.manage', label: 'Gestionar Inquilinos', category: 'Identidad' },
  
  // Clients
  { id: 'clients.view', label: 'Ver Clientes', category: 'CRM/Clientes' },
  { id: 'clients.manage', label: 'Gestionar Clientes', category: 'CRM/Clientes' },
  
  // Inventory
  { id: 'products.view', label: 'Ver Productos', category: 'Inventario' },
  { id: 'products.manage', label: 'Gestionar Productos', category: 'Inventario' },
  { id: 'inventory.movement', label: 'Movimientos de Stock', category: 'Inventario' },
  
  // Finance
  { id: 'budgets.view', label: 'Ver Presupuestos', category: 'Finanzas' },
  { id: 'budgets.create', label: 'Crear Presupuestos', category: 'Finanzas' },
  { id: 'budgets.approve', label: 'Aprobar Presupuestos', category: 'Finanzas' },
  { id: 'invoices.view', label: 'Ver Facturas', category: 'Finanzas' },
  { id: 'invoices.submit', label: 'Enviar Facturas (Verifactu)', category: 'Finanzas' },
  
  // Operations
  { id: 'rentals.view', label: 'Ver Alquileres', category: 'Operaciones' },
  { id: 'rentals.manage', label: 'Gestionar Alquileres', category: 'Operaciones' },
  { id: 'rentals.approve', label: 'Aprobar Alquileres', category: 'Operaciones' },
  { id: 'projects.view', label: 'Ver Proyectos', category: 'Operaciones' },
  { id: 'projects.manage', label: 'Gestionar Proyectos', category: 'Operaciones' },
  { id: 'fleet.view', label: 'Ver Flota', category: 'Operaciones' },
  { id: 'fleet.manage', label: 'Gestionar Vehículos', category: 'Operaciones' },

  { id: 'events.view', label: 'Ver Eventos', category: 'Operaciones' },
  { id: 'events.manage', label: 'Gestionar Eventos', category: 'Operaciones' },
  { id: 'services.view', label: 'Ver Servicios', category: 'Operaciones' },
  { id: 'services.manage', label: 'Gestionar Servicios', category: 'Operaciones' },
  { id: 'reports.view', label: 'Ver Reportes', category: 'Analítica' },
  { id: 'audit.view', label: 'Ver Auditoría', category: 'Cumplimiento' },
  { id: 'delivery.view', label: 'Ver Albaranes', category: 'Logística' },
  { id: 'delivery.manage', label: 'Gestionar Albaranes', category: 'Logística' },
  { id: 'billing.view', label: 'Ver Facturación', category: 'Finanzas' },
  { id: 'verifactu.view', label: 'Ver VeriFactu', category: 'Finanzas' },
  { id: 'receipts.view', label: 'Ver Recibos', category: 'Finanzas' },
  { id: 'ai.view', label: 'Ver AI Insights', category: 'General' },
];
