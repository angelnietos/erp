import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import { TenantContext, isTenantUuid } from '@josanz-erp/shared-infrastructure';
import { UserRepositoryPort, USER_REPOSITORY } from '@josanz-erp/identity-core';
import { LoginDto } from '../dtos/login.dto';
import { PlatformLoginDto } from '../dtos/platform-login.dto';

const PLATFORM_JWT_ROLES = ['PlatformOwner'] as const;
const PLATFORM_JWT_PERMISSIONS = ['platform.tenants.manage'] as const;

type AuthenticatedUserView = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  extraPermissions?: string[];
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly cls: ClsService<TenantContext>,
  ) {}

  private async resolveLoginTenantId(dto: LoginDto): Promise<string> {
    const fromHeader = this.cls.get('tenantId');
    if (fromHeader && isTenantUuid(fromHeader)) {
      const tenant = await this.prisma.tenant.findFirst({
        where: { id: fromHeader.trim(), isActive: true },
      });
      if (tenant) {
        return tenant.id;
      }
    }
    if (dto.tenantSlug) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: dto.tenantSlug },
      });
      if (!tenant) {
        throw new BadRequestException(`Unknown tenant slug: ${dto.tenantSlug}`);
      }
      return tenant.id;
    }
    throw new BadRequestException(
      'Tenant is required: send a valid x-tenant-id (UUID) or tenantSlug in the login body (e.g. "josanz" for the default seed tenant).',
    );
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    user: AuthenticatedUserView;
    tenantId: string;
  }> {
    const tenantId = await this.resolveLoginTenantId(dto);
    const user = await this.userRepository.findByEmail(dto.email, tenantId);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is deactivated');
    }

    const permissions = await this.mergeEffectivePermissions(
      tenantId,
      user.roles,
      user.extraPermissions ?? [],
    );

    const payload = {
      sub: user.id.value,
      email: user.email,
      roles: user.roles,
      permissions,
      tenantId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        permissions,
        extraPermissions: user.extraPermissions,
      },
      tenantId,
    };
  }

  async validateUser(email: string, pass: string): Promise<AuthenticatedUserView | null> {
    const user = await this.userRepository.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        permissions: [],
      };
    }
    return null;
  }

  async platformLogin(dto: PlatformLoginDto): Promise<{
    accessToken: string;
    user: AuthenticatedUserView;
    tenantId: string;
  }> {
    const email = dto.email.trim().toLowerCase();
    const row = await this.prisma.platformUser.findUnique({
      where: { email },
    });
    if (
      !row ||
      !(await bcrypt.compare(dto.password, row.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!row.isActive) {
      throw new UnauthorizedException('User is deactivated');
    }

    const userView: AuthenticatedUserView = {
      id: row.id,
      email: row.email,
      firstName: row.firstName ?? undefined,
      lastName: row.lastName ?? undefined,
      roles: [...PLATFORM_JWT_ROLES],
      permissions: [...PLATFORM_JWT_PERMISSIONS],
    };

    const payload = {
      sub: row.id,
      email: row.email,
      roles: userView.roles,
      permissions: userView.permissions,
      kind: 'platform',
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: userView,
      tenantId: '',
    };
  }

  async refreshPlatformSession(userId: string): Promise<{
    accessToken: string;
    user: AuthenticatedUserView;
    tenantId: string;
  }> {
    const row = await this.prisma.platformUser.findUnique({
      where: { id: userId },
    });
    if (!row || !row.isActive) {
      throw new UnauthorizedException('User not found');
    }

    const userView: AuthenticatedUserView = {
      id: row.id,
      email: row.email,
      firstName: row.firstName ?? undefined,
      lastName: row.lastName ?? undefined,
      roles: [...PLATFORM_JWT_ROLES],
      permissions: [...PLATFORM_JWT_PERMISSIONS],
    };

    const payload = {
      sub: row.id,
      email: row.email,
      roles: userView.roles,
      permissions: userView.permissions,
      kind: 'platform',
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: userView,
      tenantId: '',
    };
  }

  async refreshSession(userId: string, tenantId: string): Promise<{
    accessToken: string;
    user: AuthenticatedUserView;
    tenantId: string;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userRow = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true },
    });
    const effectiveTenantId = userRow?.tenantId ?? tenantId;
    if (!effectiveTenantId) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = await this.mergeEffectivePermissions(
      effectiveTenantId,
      user.roles,
      user.extraPermissions ?? [],
    );

    const payload = {
      sub: user.id.value,
      email: user.email,
      roles: user.roles,
      permissions,
      tenantId: effectiveTenantId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        permissions,
        extraPermissions: user.extraPermissions,
      },
      tenantId: effectiveTenantId,
    };
  }

  private async mergeEffectivePermissions(
    tenantId: string,
    roleNames: string[],
    extraPermissions: string[],
  ): Promise<string[]> {
    const rolesData = await this.prisma.role.findMany({
      where: { tenantId, name: { in: roleNames } },
      select: { permissions: true },
    });
    const fromRoles = rolesData.flatMap((r) => r.permissions);
    return Array.from(new Set([...fromRoles, ...extraPermissions]));
  }
}
