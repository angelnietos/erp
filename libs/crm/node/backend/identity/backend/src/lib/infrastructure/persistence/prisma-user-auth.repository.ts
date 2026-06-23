import { Injectable } from '@nestjs/common';
import { PrismaService } from '@generic-crm/shared-infrastructure';
import type {
  UserAuthRepositoryPort,
  UserForLogin,
  UserProfile,
} from '@generic-crm/identity-core';

const roleInclude = { roles: { include: { role: true } } } as const;

@Injectable()
export class PrismaUserAuthRepository implements UserAuthRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findForLogin(
    tenantId: string,
    emailNormalized: string,
  ): Promise<UserForLogin | null> {
    console.log('[DEBUG:findForLogin] Looking up:', {
      tenantId,
      emailNormalized,
    });

    const u = await this.prisma.user.findFirst({
      where: { tenantId, email: emailNormalized },
      include: roleInclude,
    });

    console.log('[DEBUG:findForLogin] DB returned user:', !!u);

    if (!u) {
      console.log('[DEBUG:findForLogin] No user found for criteria');
      return null;
    }

    console.log(
      '[DEBUG:findForLogin] Found user id:',
      u.id,
      'active:',
      u.isActive,
      'hash present:',
      !!u.password,
    );
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      passwordHash: u.password,
      isActive: u.isActive,
      roleNames: u.roles.map((r) => r.role.name),
      extraPermissions: u.extraPermissions ?? [],
    };
  }

  async findActiveSession(
    tenantId: string,
    userId: string,
  ): Promise<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    roleNames: string[];
  } | null> {
    const u = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, isActive: true },
      include: roleInclude,
    });
    if (!u) {
      return null;
    }
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      isActive: u.isActive,
      roleNames: u.roles.map((r) => r.role.name),
    };
  }

  async getEffectivePermissions(
    tenantId: string,
    userId: string,
  ): Promise<string[]> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: roleInclude,
    });
    if (!user) {
      return [];
    }
    const fromRoles = user.roles.flatMap((ur) => ur.role.permissions ?? []);
    const extra = user.extraPermissions ?? [];
    return [...new Set([...fromRoles, ...extra])];
  }

  async findProfile(
    tenantId: string,
    userId: string,
  ): Promise<UserProfile | null> {
    const u = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: roleInclude,
    });
    if (!u) {
      return null;
    }
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      isActive: u.isActive,
      roles: u.roles.map((ur) => ({
        name: ur.role.name,
        permissions: ur.role.permissions ?? [],
      })),
    };
  }
}
