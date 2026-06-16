import { PERMISSIONS_CATALOG, type PermissionCatalogEntry } from '@josanz-erp/identity-api';
import { RoleType } from '@josanz-erp/identity-core';

export interface Role {
  id: string;
  name: string;
  description?: string;
  type: RoleType;
  permissions: string[];
}

export type Permission = PermissionCatalogEntry;

export { PERMISSIONS_CATALOG };
