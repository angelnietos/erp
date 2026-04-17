import { SetMetadata } from '@nestjs/common';

/** When true, `TenantGuard` does not require `x-tenant-id` (use with JWT + role guards). */
export const SKIP_TENANT_GUARD_KEY = 'skipTenantGuard';
export const SkipTenantGuard = () => SetMetadata(SKIP_TENANT_GUARD_KEY, true);
