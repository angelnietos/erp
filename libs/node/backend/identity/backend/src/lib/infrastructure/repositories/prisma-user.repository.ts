import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import { UserRepositoryPort, User } from '@josanz-erp/identity-core';
import { TenantContext } from '@josanz-erp/shared-infrastructure';

type PrismaUserWithRoles = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
}>;

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService<TenantContext>,
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

  private resolveTenantId(explicit?: string): string {
    if (explicit) {
      return explicit;
    }
    return this.requireTenantId();
  }

  async findByEmail(
    email: string,
    tenantIdParam?: string,
  ): Promise<User | null> {
    const tenantId = this.resolveTenantId(tenantIdParam);
    const data = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
      include: { roles: { include: { role: true } } },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    if (!data) return null;
    // Verify the user belongs to the current tenant
    const tenantId = this.requireTenantId();
    if (data.tenantId !== tenantId) return null;
    return this.mapToDomain(data);
  }

  async findAll(tenantIdParam?: string): Promise<User[]> {
    const tenantId = this.resolveTenantId(tenantIdParam);
    const data = await this.prisma.user.findMany({
      where: { tenantId },
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return data.map(this.mapToDomain);
  }

  async save(user: User): Promise<void> {
    const tenantId = this.resolveTenantId();
    const userId = user.id.value;
    await this.prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: userId },
        update: {
          email: user.email,
          password: user.passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          category: user.category,
          extraPermissions: user.extraPermissions,
          updatedAt: new Date(),
        },
        create: {
          id: userId,
          tenantId,
          email: user.email,
          password: user.passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          category: user.category,
          extraPermissions: user.extraPermissions,
          createdAt: user.createdAt,
        },
      });

      await tx.userRole.deleteMany({ where: { userId } });
      if (user.roles.length > 0) {
        const rows = await tx.role.findMany({
          where: { tenantId, name: { in: user.roles } },
          select: { id: true },
        });
        if (rows.length > 0) {
          await tx.userRole.createMany({
            data: rows.map((r) => ({ userId, roleId: r.id })),
            skipDuplicates: true,
          });
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private mapToDomain(data: PrismaUserWithRoles): User {
    return User.reconstitute(data.id, {
      email: data.email,
      passwordHash: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: data.isActive,
      category: data.category,
      roles: (data.roles || []).map((r) => r.role.name),
      extraPermissions: data.extraPermissions ?? [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
