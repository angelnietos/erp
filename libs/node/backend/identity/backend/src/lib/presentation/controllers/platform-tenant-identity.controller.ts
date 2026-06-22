import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  SkipTenantGuard,
} from '@josanz-erp/shared-infrastructure';
import { PlatformJwtGuard } from '../guards/platform-jwt.guard';
import { RolesService } from '../../application/services/roles.service';
import { UsersService } from '../../application/services/users.service';
import { PlatformTenantContextService } from '../../application/services/platform-tenant-context.service';
import { KeycloakIdentitySyncService } from '../../application/services/keycloak-identity-sync.service';
import { RoleType } from '@josanz-erp/identity-core';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../../application/dtos/user.dtos';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

class PlatformCreateRoleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RoleType)
  type!: RoleType;

  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}

class PlatformUpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

class PlatformCreateUserDto extends CreateUserDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsArray()
  @IsString({ each: true })
  roles!: string[];

  @IsOptional()
  @IsBoolean()
  sendInviteEmail?: boolean;
}

@UseGuards(JwtAuthGuard, PlatformJwtGuard, PermissionsGuard)
@SkipTenantGuard()
@Controller('platform/tenants/:tenantId')
export class PlatformTenantIdentityController {
  constructor(
    private readonly tenantContext: PlatformTenantContextService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly kcSync: KeycloakIdentitySyncService,
  ) {}

  @Get('roles')
  @RequirePermissions('platform.identity.read', 'platform.identity.manage', 'platform.tenants.manage')
  listRoles(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.tenantContext.runInTenant(tenantId, () =>
      this.rolesService.findAll(tenantId),
    );
  }

  @Get('roles/permissions')
  @RequirePermissions('platform.identity.read', 'platform.identity.manage', 'platform.tenants.manage')
  listRolePermissions(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.tenantContext.runInTenant(tenantId, async () =>
      this.rolesService.getPermissionsList(),
    );
  }

  @Get('roles/:roleId')
  @RequirePermissions('platform.identity.read', 'platform.identity.manage', 'platform.tenants.manage')
  getRole(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.tenantContext.runInTenant(tenantId, () =>
      this.rolesService.findById(roleId, tenantId),
    );
  }

  @Post('roles')
  @RequirePermissions('platform.identity.manage', 'platform.tenants.manage')
  createRole(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() body: PlatformCreateRoleDto,
  ) {
    return this.tenantContext.runInTenant(tenantId, () =>
      this.rolesService.create(tenantId, body),
    );
  }

  @Put('roles/:roleId')
  @RequirePermissions('platform.identity.manage', 'platform.tenants.manage')
  updateRole(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() body: PlatformUpdateRoleDto,
  ) {
    return this.tenantContext.runInTenant(tenantId, () =>
      this.rolesService.update(roleId, tenantId, body),
    );
  }

  @Delete('roles/:roleId')
  @RequirePermissions('platform.identity.manage', 'platform.tenants.manage')
  async deleteRole(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    await this.tenantContext.runInTenant(tenantId, () =>
      this.rolesService.delete(roleId, tenantId),
    );
    return { message: 'Rol eliminado' };
  }

  @Get('users')
  @RequirePermissions('platform.identity.read', 'platform.identity.manage', 'platform.tenants.manage')
  listUsers(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.tenantContext.runInTenant(tenantId, () =>
      this.usersService.findAll(),
    );
  }

  @Get('users/:userId')
  @RequirePermissions('platform.identity.read', 'platform.identity.manage', 'platform.tenants.manage')
  getUser(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.tenantContext.runInTenant(tenantId, () =>
      this.usersService.findById(userId),
    );
  }

  @Post('users')
  @RequirePermissions('platform.identity.manage', 'platform.tenants.manage')
  createUser(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() body: PlatformCreateUserDto,
  ) {
    return this.tenantContext.runInTenant(tenantId, () =>
      this.usersService.create(body),
    );
  }

  @Put('users/:userId')
  @RequirePermissions('platform.identity.manage', 'platform.tenants.manage')
  updateUser(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.tenantContext.runInTenant(tenantId, () =>
      this.usersService.update(userId, body),
    );
  }

  @Delete('users/:userId')
  @RequirePermissions('platform.identity.manage', 'platform.tenants.manage')
  async deleteUser(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    await this.tenantContext.runInTenant(tenantId, () =>
      this.usersService.delete(userId),
    );
    return { message: 'Usuario eliminado' };
  }

  @Post('users/:userId/sync/keycloak')
  @RequirePermissions('platform.sync.manage', 'platform.identity.manage', 'platform.tenants.manage')
  syncUserToKeycloak(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.kcSync.pushTenantUserToKeycloak(tenantId, userId);
  }
}
