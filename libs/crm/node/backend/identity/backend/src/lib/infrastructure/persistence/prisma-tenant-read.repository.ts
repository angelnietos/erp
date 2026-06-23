import { Injectable } from '@nestjs/common';
import { PrismaService } from '@generic-crm/shared-infrastructure';
import type { TenantReadRepositoryPort } from '@generic-crm/identity-core';

@Injectable()
export class PrismaTenantReadRepository implements TenantReadRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async existsActiveById(id: string): Promise<boolean> {
    const row = await this.prisma.tenant.findFirst({
      where: { id, isActive: true },
      select: { id: true },
    });
    return !!row;
  }

  async findActiveIdBySlug(slug: string): Promise<string | null> {
    const row = await this.prisma.tenant.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  async findActiveSummaryById(id: string): Promise<{
    id: string;
    slug: string;
    name: string;
  } | null> {
    const row = await this.prisma.tenant.findFirst({
      where: { id, isActive: true },
      select: { id: true, slug: true, name: true },
    });
    return row ?? null;
  }
}
