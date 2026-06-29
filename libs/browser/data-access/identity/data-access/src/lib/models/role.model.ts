import { PERMISSIONS_CATALOG, type PermissionCatalogEntry } from '@josanz-erp/identity-api';

/** Valores alineados con RoleType en @josanz-erp/identity-core (sin importar domain → shared-model en rollup). */
export type RoleType = 'SUPERADMIN' | 'ADMIN' | 'RESPONSIBLE' | 'USER';

export interface Role {
  id: string;
  name: string;
  description?: string;
  type: RoleType;
  permissions: string[];
}

export type Permission = PermissionCatalogEntry;

export { PERMISSIONS_CATALOG };
