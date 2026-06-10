import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SkipTenantGuard } from '@josanz-erp/shared-infrastructure';
import { PlatformJwtGuard } from '../guards/platform-jwt.guard';
import { TenantModulesService } from '../../application/services/tenant-modules.service';
import { TenantRealmSyncService } from '../../application/services/tenant-realm-sync.service';
import { normalizeTenantModuleIds } from '@josanz-erp/identity-api';
import { AuthGuard } from '@nestjs/passport';

class UpdateTenantModulesDto {
  enabledModuleIds!: string[];
}

@UseGuards(AuthGuard('platform-jwt'), PlatformJwtGuard)
@Controller('platform/tenants')
export class PlatformTenantsController {
  constructor(
    private readonly tenantModulesService: TenantModulesService,
    private readonly tenantRealmSyncService: TenantRealmSyncService,
  ) {}

  @SkipTenantGuard()
  @Get()
  async getAllTenants() {
    const tenants = await this.tenantModulesService.getAllTenants();
    return tenants;
  }

  @SkipTenantGuard()
  @Put(':tenantId/modules')
  async updateTenantModules(
    @Param('tenantId') tenantId: string,
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
}