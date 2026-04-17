import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';
import { JwtAuthGuard, TenantGuard } from '@josanz-erp/shared-infrastructure';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '@josanz-erp/shared-infrastructure';
import { TenantModulesService } from '../../application/services/tenant-modules.service';

class UpdateTenantModulesDto {
  @IsArray()
  @IsString({ each: true })
  enabledModuleIds!: string[];
}

type JwtUser = {
  permissions?: string[];
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

  private canManageModules(user: JwtUser | undefined): boolean {
    const p = user?.permissions ?? [];
    return (
      p.includes('*') ||
      p.includes('users.manage') ||
      p.includes('roles.manage')
    );
  }

  @Get()
  async get(@Req() req: { user?: JwtUser }) {
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
    return this.tenantModulesService.updateEnabledModuleIds(
      this.tenantId,
      body,
      this.canManageModules(req.user),
    );
  }
}
