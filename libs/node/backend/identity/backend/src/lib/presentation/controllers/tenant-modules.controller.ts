import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';
import { JwtAuthGuard, TenantGuard } from '@josanz-erp/shared-infrastructure';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '@josanz-erp/shared-infrastructure';
import { normalizeTenantModuleIds } from '@josanz-erp/identity-api';
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

@Controller('tenant/modules')
@UseGuards(JwtAuthGuard, TenantGuard)
export class TenantModulesController {
  constructor(
    private readonly tenantModulesService: TenantModulesService,
    private readonly cls: ClsService<TenantContext>,
  ) {}

  private get tenantId(): string {
    return this.cls.get('tenantId');
  }

  private canActivateModules(user: JwtUser | undefined): boolean {
    const p = user?.permissions ?? [];
    return (
      p.includes('*') ||
      p.includes('users.manage') ||
      p.includes('roles.manage')
    );
  }

  @Get()
  async get() {
    const enabledModuleIds = await this.tenantModulesService.getEnabledModuleIds(
      this.tenantId,
    );
    return { enabledModuleIds };
  }

  @Put()
  async put(
    @Req() req: { user?: JwtUser },
    @Body() body: UpdateTenantModulesDto,
  ) {
    const current = await this.tenantModulesService.getEnabledModuleIds(
      this.tenantId,
    );
    const next = normalizeTenantModuleIds(body.enabledModuleIds ?? []);
    const roles = req.user?.roles ?? [];
    const isSuperAdmin = roles.includes('SuperAdmin');

    const removed = current.filter((id) => !next.includes(id));
    if (removed.length > 0 && !isSuperAdmin) {
      throw new ForbiddenException(
        'Solo el SuperAdmin puede desactivar módulos.',
      );
    }

    const added = next.filter((id) => !current.includes(id));
    if (added.length > 0 && !this.canActivateModules(req.user)) {
      throw new ForbiddenException(
        'No tienes permiso para activar módulos.',
      );
    }

    return this.tenantModulesService.updateEnabledModuleIds(
      this.tenantId,
      body,
    );
  }
}
