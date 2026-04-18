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
} from '@nestjs/common';
import { RolesService } from '../../application/services/roles.service';
import { JwtAuthGuard, TenantGuard } from '@josanz-erp/shared-infrastructure';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from '@josanz-erp/shared-infrastructure';
import { RoleType } from '@josanz-erp/identity-core';

@Controller('roles')
@UseGuards(JwtAuthGuard, TenantGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly cls: ClsService<TenantContext>
  ) {}

  private get tenantId(): string {
    return this.cls.get('tenantId');
  }

  @Get()
  async findAll() {
    return this.rolesService.findAll(this.tenantId);
  }

  @Get('permissions')
  async getPermissions() {
    return this.rolesService.getPermissionsList();
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findById(id, this.tenantId);
  }

  @Post()
  async create(@Body() dto: { name: string; description?: string; type: RoleType; permissions: string[] }) {
    return this.rolesService.create(this.tenantId, dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { name?: string; description?: string; permissions?: string[] },
  ) {
    return this.rolesService.update(id, this.tenantId, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.rolesService.delete(id, this.tenantId);
    return { message: 'Role deleted successfully' };
  }
}
