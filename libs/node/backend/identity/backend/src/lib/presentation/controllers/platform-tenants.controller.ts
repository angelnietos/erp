import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TenantModulesService } from '../../application/services/tenant-modules.service';
import { TenantRealmSyncService } from '../../application/services/tenant-realm-sync.service';
import { normalizeTenantModuleIds } from '@josanz-erp/identity-api';
import { PlatformJwtGuard } from '../guards/platform-jwt.guard';

class UpdateTenantModulesDto {
  enabledModuleIds!: string[];
}

@UseGuards(PlatformJwtGuard)
@Controller('platform/tenants')
export class PlatformTenantsController {
  constructor(
    private readonly tenantModulesService: TenantModulesService,
    private readonly tenantRealmSyncService: TenantRealmSyncService,
  ) {}

  @Get()
  async getAllTenants() {
    const tenants = await this.tenantModulesService.getAllTenants();
    return tenants;
  }

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