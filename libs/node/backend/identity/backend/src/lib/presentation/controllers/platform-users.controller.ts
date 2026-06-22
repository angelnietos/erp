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
import {
  PlatformUsersService,
  type CreatePlatformUserDto,
  type UpdatePlatformUserDto,
} from '../../application/services/platform-users.service';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

class CreatePlatformUserBody implements CreatePlatformUserDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  syncToKeycloak?: boolean;
}

class UpdatePlatformUserBody implements UpdatePlatformUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  syncToKeycloak?: boolean;
}

class SyncPlatformUserBody {
  @IsOptional()
  @MinLength(6)
  password?: string;
}

@UseGuards(JwtAuthGuard, PlatformJwtGuard, PermissionsGuard)
@SkipTenantGuard()
@Controller('platform/users')
export class PlatformUsersController {
  constructor(private readonly platformUsers: PlatformUsersService) {}

  @Get()
  @RequirePermissions('platform.users.read', 'platform.users.manage', 'platform.tenants.manage')
  list() {
    return this.platformUsers.findAll();
  }

  @Get(':id')
  @RequirePermissions('platform.users.read', 'platform.users.manage', 'platform.tenants.manage')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.platformUsers.findById(id);
  }

  @Post()
  @RequirePermissions('platform.users.manage', 'platform.tenants.manage')
  create(@Body() body: CreatePlatformUserBody) {
    return this.platformUsers.create(body);
  }

  @Put(':id')
  @RequirePermissions('platform.users.manage', 'platform.tenants.manage')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePlatformUserBody,
  ) {
    return this.platformUsers.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('platform.users.manage', 'platform.tenants.manage')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.platformUsers.delete(id);
    return { message: 'Usuario de plataforma eliminado' };
  }

  @Post(':id/sync/keycloak')
  @RequirePermissions('platform.sync.manage', 'platform.users.manage', 'platform.tenants.manage')
  syncToKeycloak(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SyncPlatformUserBody,
  ) {
    return this.platformUsers.syncToKeycloak(id, body.password);
  }
}
