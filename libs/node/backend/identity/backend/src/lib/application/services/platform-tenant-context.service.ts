import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService, TenantContext } from '@josanz-erp/shared-infrastructure';

@Injectable()
export class PlatformTenantContextService {
  constructor(
    private readonly cls: ClsService<TenantContext>,
    private readonly prisma: PrismaService,
  ) {}

  async assertActiveTenant(tenantId: string): Promise<{ id: string; slug: string; name: string }> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, isActive: true },
      select: { id: true, slug: true, name: true },
    });
    if (!tenant) {
      throw new NotFoundException('Organización no encontrada o inactiva');
    }
    return tenant;
  }

  async runInTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    await this.assertActiveTenant(tenantId);
    const previous = this.cls.get('tenantId');
    this.cls.set('tenantId', tenantId);
    try {
      return await fn();
    } finally {
      this.cls.set('tenantId', previous);
    }
  }
}
