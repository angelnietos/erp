import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RolesService } from '../../application/services/roles.service';
import { JwtAuthGuard, TenantGuard } from '@josanz-erp/shared-infrastructure';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '@josanz-erp/shared-infrastructure';
import { RoleType } from '@josanz-erp/identity-core';
import { assertUserPermissions } from '../../application/utils/request-auth';

type JwtUser = { permissions?: string[] };

@Controller('roles')
@UseGuards(JwtAuthGuard, TenantGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly cls: ClsService<TenantContext>,
  ) {}

  private get tenantId(): string {
    return this.cls.get('tenantId');
  }

  @Get()
  async findAll(@Req() req: Request & { user?: JwtUser }) {
    assertUserPermissions(req.user, ['roles.manage', 'users.manage']);
    return this.rolesService.findAll(this.tenantId);
  }

  @Get('permissions')
  async getPermissions(@Req() req: Request & { user?: JwtUser }) {
    assertUserPermissions(req.user, ['roles.manage', 'users.manage']);
    return this.rolesService.getPermissionsList();
  }

  @Get(':id')
  async findById(
    @Req() req: Request & { user?: JwtUser },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertUserPermissions(req.user, ['roles.manage']);
    return this.rolesService.findById(id, this.tenantId);
  }

  @Post()
  async create(
    @Req() req: Request & { user?: JwtUser },
    @Body() dto: { name: string; description?: string; type: RoleType; permissions: string[] },
  ) {
    assertUserPermissions(req.user, ['roles.manage']);
    return this.rolesService.create(this.tenantId, dto);
  }

  @Put(':id')
  async update(
    @Req() req: Request & { user?: JwtUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { name?: string; description?: string; permissions?: string[] },
  ) {
    assertUserPermissions(req.user, ['roles.manage']);
    return this.rolesService.update(id, this.tenantId, dto);
  }

  @Delete(':id')
  async delete(
    @Req() req: Request & { user?: JwtUser },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertUserPermissions(req.user, ['roles.manage']);
    await this.rolesService.delete(id, this.tenantId);
    return { message: 'Rol eliminado correctamente' };
  }
}
