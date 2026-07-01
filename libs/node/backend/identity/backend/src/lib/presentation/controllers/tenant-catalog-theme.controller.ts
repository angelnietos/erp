import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { JwtAuthGuard, TenantGuard, TenantContext } from '@josanz-erp/shared-infrastructure';
import { isTenantUuid } from '@josanz-erp/shared-infrastructure';
import {
  TenantCatalogThemeService,
  type TenantCatalogThemeDto,
} from '../../application/services/tenant-catalog-theme.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('tenant/catalog-theme')
export class TenantCatalogThemeController {
  constructor(
    private readonly catalogThemeService: TenantCatalogThemeService,
    private readonly cls: ClsService<TenantContext>,
  ) {}

  private getTenantId(req: Request): string | undefined {
    const queryTenant = req.query.tenantId as string | undefined;
    if (queryTenant && isTenantUuid(queryTenant)) {
      return queryTenant;
    }
    const headerTenant = req.headers['x-tenant-id'] as string | undefined;
    if (headerTenant && isTenantUuid(headerTenant)) {
      return headerTenant;
    }
    const user = req.user as { tenantId?: string } | undefined;
    if (user?.tenantId && isTenantUuid(user.tenantId)) {
      return user.tenantId;
    }
    return this.cls.get('tenantId') ?? undefined;
  }

  @Get()
  async get(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant ID required.');
    }
    return this.catalogThemeService.getCatalogTheme(tenantId);
  }

  @Put()
  async put(@Req() req: Request, @Body() body: TenantCatalogThemeDto) {
    const tenantId = this.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant ID required.');
    }
    return this.catalogThemeService.updateCatalogTheme(tenantId, body);
  }
}
