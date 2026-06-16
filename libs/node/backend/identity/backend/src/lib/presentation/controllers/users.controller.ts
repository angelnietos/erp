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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../../application/services/users.service';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../../application/dtos/user.dtos';
import { JwtAuthGuard, TenantGuard } from '@josanz-erp/shared-infrastructure';
import { assertUserPermissions } from '../../application/utils/request-auth';

type JwtUser = { permissions?: string[] };

@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Req() req: Request & { user?: JwtUser }) {
    assertUserPermissions(req.user, ['users.view', 'users.manage']);
    return this.usersService.findAll();
  }

  @Get(':id')
  async findById(
    @Req() req: Request & { user?: JwtUser },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertUserPermissions(req.user, ['users.view', 'users.manage']);
    return this.usersService.findById(id);
  }

  @Post()
  async create(
    @Req() req: Request & { user?: JwtUser },
    @Body() dto: CreateUserDto,
  ) {
    assertUserPermissions(req.user, ['users.manage']);
    return this.usersService.create(dto);
  }

  @Put(':id')
  async update(
    @Req() req: Request & { user?: JwtUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    assertUserPermissions(req.user, ['users.manage']);
    return this.usersService.update(id, dto);
  }

  @Post(':id/send-invite')
  @HttpCode(HttpStatus.OK)
  sendInvite(
    @Req() req: Request & { user?: JwtUser },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertUserPermissions(req.user, ['users.manage']);
    return this.usersService.sendInviteEmail(id);
  }

  @Delete(':id')
  async delete(
    @Req() req: Request & { user?: JwtUser },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertUserPermissions(req.user, ['users.manage']);
    await this.usersService.delete(id);
    return { message: 'Usuario eliminado correctamente' };
  }
}
