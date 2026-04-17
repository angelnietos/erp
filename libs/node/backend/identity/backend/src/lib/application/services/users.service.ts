import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import * as bcrypt from 'bcrypt';
import {
  UserRepositoryPort,
  USER_REPOSITORY,
  User,
} from '@josanz-erp/identity-core';
import {
  User as UserApi,
} from '@josanz-erp/identity-api';
import {
  DEFAULT_TENANT_MODULE_IDS,
  filterPermissionsToEnabledModules,
  normalizeTenantModuleIds,
} from '@josanz-erp/identity-api';
import {
  PrismaService,
  TenantContext,
} from '@josanz-erp/shared-infrastructure';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../dtos/user.dtos';
import { TenantIdentityNotifierService } from './tenant-identity-notifier.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly prisma: PrismaService,
    private readonly cls: ClsService<TenantContext>,
    private readonly identityNotifier: TenantIdentityNotifierService,
  ) {}

  private requireTenantId(): string {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new UnauthorizedException(
        'Missing tenant context: x-tenant-id header is required for this operation.',
      );
    }
    return tenantId;
  }

  private async resolveTenantEnabledModules(tenantId: string): Promise<string[]> {
    const t = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { enabledModuleIds: true },
    });
    const raw = t?.enabledModuleIds;
    if (raw && raw.length > 0) {
      return normalizeTenantModuleIds(raw);
    }
    return [...DEFAULT_TENANT_MODULE_IDS];
  }

  private assertStringArrayField(
    value: unknown,
    fieldName: string,
  ): asserts value is string[] | undefined {
    if (value === undefined) {
      return;
    }
    if (
      !Array.isArray(value) ||
      !value.every((p) => typeof p === 'string')
    ) {
      throw new BadRequestException(
        `${fieldName} must be an array of strings`,
      );
    }
  }

  private mergePermissionSets(
    filteredRoles: string[],
    rolePermissionsMap: Map<string, string[]>,
    extraPermissions: string[],
  ): string[] {
    const allPerms = new Set<string>();
    filteredRoles.forEach((roleName) => {
      const perms = rolePermissionsMap.get(roleName) || [];
      perms.forEach((p) => allPerms.add(p));
    });
    extraPermissions.forEach((p) => allPerms.add(p));
    return Array.from(allPerms);
  }

  async findAll(): Promise<UserApi[]> {
    const tenantId = this.requireTenantId();
    const users = await this.userRepository.findAll();

    const rolesData = await this.prisma.role.findMany({
      where: { tenantId },
      select: { name: true, permissions: true },
    });

    const rolePermissionsMap = new Map<string, string[]>(
      rolesData.map((r) => [r.name, r.permissions]),
    );

    const tenantRoleNames = new Set(rolesData.map((r) => r.name));

    return users.map((user) => {
      const filteredRoles = user.roles.filter((r) => tenantRoleNames.has(r));
      const permissions = this.mergePermissionSets(
        filteredRoles,
        rolePermissionsMap,
        user.extraPermissions ?? [],
      );

      return {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: filteredRoles,
        permissions,
        extraPermissions: user.extraPermissions ?? [],
        category: user.category,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
      };
    });
  }

  async findById(id: string): Promise<UserApi> {
    const tenantId = this.requireTenantId();
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rolesData = await this.prisma.role.findMany({
      where: {
        tenantId,
        name: { in: user.roles },
      },
      select: { name: true, permissions: true },
    });

    const rolePermissionsMap = new Map(rolesData.map((r) => [r.name, r.permissions]));
    const filteredRoles = rolesData.map((r) => r.name);
    const permissions = this.mergePermissionSets(
      filteredRoles,
      rolePermissionsMap,
      user.extraPermissions ?? [],
    );

    return {
      id: user.id.value,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: filteredRoles,
      permissions,
      extraPermissions: user.extraPermissions ?? [],
      category: user.category,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }

  async create(dto: CreateUserDto): Promise<UserApi> {
    const tenantId = this.requireTenantId();
    this.assertStringArrayField(dto.extraPermissions, 'extraPermissions');
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const tenantRoles = await this.prisma.role.findMany({
      where: { tenantId },
      select: { name: true },
    });
    const allowed = new Set(tenantRoles.map((r) => r.name));
    const roles = (dto.roles || []).filter((n) => allowed.has(n));

    const mods = await this.resolveTenantEnabledModules(tenantId);
    const extraPermissions = dto.extraPermissions?.length
      ? filterPermissionsToEnabledModules(dto.extraPermissions, mods)
      : [];

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = User.create({
      email: dto.email,
      passwordHash: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles,
      extraPermissions,
      category: dto.category,
    });

    await this.userRepository.save(user);
    this.identityNotifier.notifyIdentityUpdated(tenantId);

    return this.findById(user.id.value);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserApi> {
    const tenantId = this.requireTenantId();
    this.assertStringArrayField(dto.extraPermissions, 'extraPermissions');
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    user.updateProfile(dto.firstName, dto.lastName, dto.category);

    if (dto.email) {
      user.updateEmail(dto.email);
    }

    if (dto.roles !== undefined) {
      const tenantRoles = await this.prisma.role.findMany({
        where: { tenantId },
        select: { name: true },
      });
      const allowed = new Set(tenantRoles.map((r) => r.name));
      user.setRoles(dto.roles.filter((n) => allowed.has(n)));
    }

    if (dto.extraPermissions !== undefined) {
      const mods = await this.resolveTenantEnabledModules(tenantId);
      user.setExtraPermissions(
        filterPermissionsToEnabledModules(dto.extraPermissions, mods),
      );
    }

    if (dto.isActive !== undefined) {
      user.setIsActive(dto.isActive);
    }

    await this.userRepository.save(user);
    this.identityNotifier.notifyIdentityUpdated(tenantId);

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const tenantId = this.requireTenantId();
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
    this.identityNotifier.notifyIdentityUpdated(tenantId);
  }
}
