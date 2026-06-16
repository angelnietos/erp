import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Put,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';
import { Request } from 'express';
import { JwtAuthGuard, TenantGuard } from '@josanz-erp/shared-infrastructure';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '@josanz-erp/shared-infrastructure';
import { isTenantUuid } from '@josanz-erp/shared-infrastructure';
import { normalizeTenantModuleIds, PROTECTED_TENANT_MODULE_IDS } from '@josanz-erp/identity-api';
import { userHasAnyPermission } from '../../application/utils/permission-merge';
import { TenantModulesService } from '../../application/services/tenant-modules.service';

class UpdateTenantModulesDto {
  @IsArray()
  @IsString({ each: true })
  enabledModuleIds!: string[];
}

type JwtUser = {
  permissions?: string[];
  roles?: string[];
};

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('tenant/modules')
export class TenantModulesController {
  constructor(
    private readonly tenantModulesService: TenantModulesService,
    private readonly cls: ClsService<TenantContext>,
  ) {}

  private getTenantId(req: Request): string | undefined {
    // 1. Query param (for platform admins cross-tenant access)
    const queryTenant = req.query.tenantId as string | undefined;
    if (queryTenant && isTenantUuid(queryTenant)) {
      return queryTenant;
    }
    // 2. Header (for platform admins)
    const headerTenant = req.headers['x-tenant-id'] as string | undefined;
    if (headerTenant && isTenantUuid(headerTenant)) {
      return headerTenant;
    }
    // 3. From user (if JwtAuthGuard already ran)
    const user = req.user as { tenantId?: string } | undefined;
    if (user?.tenantId && isTenantUuid(user.tenantId)) {
      return user.tenantId;
    }
    // 4. Fall back to CLS (set by middleware)
    const clsTenant = this.cls.get('tenantId');
    return clsTenant ?? undefined;
  }

  private canManageModules(user: JwtUser | undefined): boolean {
    return userHasAnyPermission(user?.permissions, [
      '*',
      'modules.manage',
      'users.manage',
      'roles.manage',
    ]);
  }

  @Get()
  async get(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant ID required: provide via query ?tenantId=xxx, header x-tenant-id, or ensure JWT contains tenant_id claim.');
    }
    const enabledModuleIds = await this.tenantModulesService.getEnabledModuleIds(
      tenantId,
    );
    return { enabledModuleIds };
  }

  @Put()
  async put(
    @Req() req: Request & { user?: JwtUser },
    @Body() body: UpdateTenantModulesDto,
  ) {
    const tenantId = this.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant ID required: provide via query ?tenantId=xxx, header x-tenant-id, or ensure JWT contains tenant_id claim.');
    }
    const current = await this.tenantModulesService.getEnabledModuleIds(
      tenantId,
    );
    const next = normalizeTenantModuleIds(body.enabledModuleIds ?? []);
    const protectedSet = new Set(PROTECTED_TENANT_MODULE_IDS);
    for (const id of protectedSet) {
      if (!next.includes(id)) {
        throw new BadRequestException(
          `El módulo "${id}" es obligatorio y no puede desactivarse.`,
        );
      }
    }

    const removed = current.filter((id) => !next.includes(id));
    if (removed.length > 0 && !this.canManageModules(req.user)) {
      throw new ForbiddenException(
        'No tienes permiso para desactivar módulos.',
      );
    }

    const added = next.filter((id) => !current.includes(id));
    if (added.length > 0 && !this.canManageModules(req.user)) {
      throw new ForbiddenException(
        'No tienes permiso para activar módulos.',
      );
    }

    return this.tenantModulesService.updateEnabledModuleIds(
      tenantId,
      body,
    );
  }
}
