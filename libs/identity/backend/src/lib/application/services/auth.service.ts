import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import { TenantContext, isTenantUuid } from '@josanz-erp/shared-infrastructure';
import { UserRepositoryPort, USER_REPOSITORY } from '@josanz-erp/identity-core';
import { LoginDto } from '../dtos/login.dto';

type AuthenticatedUserView = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
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

    const payload = { 
      sub: user.id.value, 
      email: user.email, 
      roles: user.roles 
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
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
      };
    }
    return null;
  }
}
