import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@josanz-erp/shared-data-access';
import { UserRepositoryPort, User } from '@josanz-erp/identity-core';
import { TenantContext } from '@josanz-erp/shared-infrastructure';

type PrismaUserWithRoles = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
}>;

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const tenantId = this.tenantContext.getRequiredTenantId();
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
    const tenantId = this.tenantContext.getRequiredTenantId();
    if (data.tenantId !== tenantId) return null;
    return this.mapToDomain(data);
  }

  async save(user: User): Promise<void> {
    const tenantId = this.tenantContext.getRequiredTenantId();
    await this.prisma.user.upsert({
      where: { id: user.id.value },
      update: {
        email: user.email,
        password: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
      create: {
        id: user.id.value,
        tenantId,
        email: user.email,
        password: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
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
      roles: (data.roles || []).map((r) => r.role.name),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
