import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  SkipTenantGuard,
} from '@josanz-erp/shared-infrastructure';
import { PlatformJwtGuard } from '../guards/platform-jwt.guard';
import { TenantModulesService } from '../../application/services/tenant-modules.service';
import { TenantRealmSyncService } from '../../application/services/tenant-realm-sync.service';
import { KeycloakIdentitySyncService } from '../../application/services/keycloak-identity-sync.service';
import { normalizeTenantModuleIds } from '@josanz-erp/identity-api';
import {
  PERMISSIONS_CATALOG,
  PLATFORM_PERMISSIONS_CATALOG,
  TENANT_MODULE_CATALOG,
  permissionsGroupedByModule,
  TENANT_KEYCLOAK_REALM,
  PLATFORM_KEYCLOAK_BINDING,
} from '@josanz-erp/identity-api';
import { IsArray, IsEmail, IsString } from 'class-validator';

class UpdateTenantModulesDto {
  @IsArray()
  @IsString({ each: true })
  enabledModuleIds!: string[];
}

class PullKeycloakUserDto {
  @IsEmail()
  email!: string;
}

@UseGuards(JwtAuthGuard, PlatformJwtGuard, PermissionsGuard)
@SkipTenantGuard()
@Controller('platform/tenants')
export class PlatformTenantsController {
  constructor(
    private readonly tenantModulesService: TenantModulesService,
    private readonly tenantRealmSyncService: TenantRealmSyncService,
    private readonly kcSync: KeycloakIdentitySyncService,
  ) {}

  @Get('permissions-policy')
  @RequirePermissions('platform.tenants.read', 'platform.tenants.manage', 'platform.identity.read')
  getPermissionsPolicy() {
    return {
      authorizationModel: {
        tenantModules: 'Postgres Tenant.enabledModuleIds',
        erpPermissions: 'Postgres Role.permissions filtrados por módulos',
        keycloakRole: 'IdP opcional; no sustituye permisos ERP',
        platformPermissions: 'JWT platform.* unificado local + Keycloak',
      },
      erpPermissions: PERMISSIONS_CATALOG,
      platformPermissions: PLATFORM_PERMISSIONS_CATALOG,
      modules: TENANT_MODULE_CATALOG,
      permissionsByModule: permissionsGroupedByModule(),
      keycloakTenants: Object.entries(TENANT_KEYCLOAK_REALM).map(
        ([slug, binding]) => ({
          slug,
          realm: binding.realm,
          clientId: binding.clientId,
        }),
      ),
      platformKeycloak: PLATFORM_KEYCLOAK_BINDING,
    };
  }

  @Get()
  @RequirePermissions('platform.tenants.read', 'platform.tenants.manage', 'platform.identity.read')
  async getAllTenants() {
    return this.tenantModulesService.getAllTenants();
  }

  @Put(':tenantId/modules')
  @RequirePermissions('platform.tenants.manage', 'platform.modules.manage')
  async updateTenantModules(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() body: UpdateTenantModulesDto,
  ) {
    const { enabledModuleIds } = body;
    const normalized = normalizeTenantModuleIds(enabledModuleIds);
    await this.tenantModulesService.updateEnabledModuleIds(tenantId, {
      enabledModuleIds: normalized,
    });
    await this.tenantRealmSyncService.syncTenantModules(tenantId, normalized);

    return { tenantId, enabledModuleIds: normalized };
  }

  @Post(':tenantId/sync/keycloak')
  @RequirePermissions('platform.sync.manage', 'platform.identity.manage', 'platform.tenants.manage')
  pushToKeycloak(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.kcSync.pushTenantToKeycloak(tenantId);
  }

  @Post(':tenantId/sync/keycloak/pull')
  @RequirePermissions('platform.sync.manage', 'platform.identity.manage', 'platform.tenants.manage')
  pullFromKeycloak(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() body: PullKeycloakUserDto,
  ) {
    return this.kcSync.pullTenantUserFromKeycloak(tenantId, body.email);
  }
}
