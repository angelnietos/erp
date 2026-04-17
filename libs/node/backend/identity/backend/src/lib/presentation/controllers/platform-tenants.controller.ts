import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';
import {
  JwtAuthGuard,
  PrismaService,
  SkipTenantGuard,
} from '@josanz-erp/shared-infrastructure';
import { TenantModulesService } from '../../application/services/tenant-modules.service';
import { PlatformOwnerGuard } from '../guards/platform-owner.guard';

class UpdateTenantModulesDto {
  @IsArray()
  @IsString({ each: true })
  enabledModuleIds!: string[];
}

/**
 * Panel SaaS: listar tenants y asignar módulos por tenant (rol `PlatformOwner`).
 * Rutas bajo prefijo global `/api`.
 */
@Controller('platform')
@SkipTenantGuard()
@UseGuards(JwtAuthGuard, PlatformOwnerGuard)
export class PlatformTenantsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantModules: TenantModulesService,
  ) {}

  @Get('tenants')
  async listTenants() {
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        enabledModuleIds: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  @Put('tenants/:tenantId/modules')
  async putTenantModules(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() body: UpdateTenantModulesDto,
  ) {
    return this.tenantModules.updateEnabledModuleIds(tenantId, body);
  }
}
