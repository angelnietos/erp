import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard, TenantGuard } from '@generic-crm/shared-infrastructure';
import { requireRequestTenantId } from '@generic-crm/shared-infrastructure';
import type { UserAuthRepositoryPort } from '@generic-crm/identity-core';
import { USER_AUTH_REPOSITORY } from '@generic-crm/identity-core';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('users')
export class UsersController {
  constructor(
    @Inject(USER_AUTH_REPOSITORY)
    private readonly users: UserAuthRepositoryPort,
  ) {}

  @Get('me')
  async me(@Req() req: Request) {
    const tenantId = requireRequestTenantId(req);
    const u = req.user as { id?: string; sub?: string };
    const id = u?.id ?? u?.sub;
    if (!id || !tenantId) {
      return null;
    }
    return this.users.findProfile(tenantId, id);
  }
}
