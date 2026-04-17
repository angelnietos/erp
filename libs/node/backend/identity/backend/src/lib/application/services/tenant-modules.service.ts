import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import {
  DEFAULT_TENANT_MODULE_IDS,
  filterPermissionsToEnabledModules,
  normalizeTenantModuleIds,
} from '@josanz-erp/identity-api';

@Injectable()
export class TenantModulesService {
  constructor(private readonly prisma: PrismaService) {}

  private effectiveModuleIds(
    raw: string[] | null | undefined,
  ): string[] {
    if (raw && raw.length > 0) {
      return normalizeTenantModuleIds(raw);
    }
    return [...DEFAULT_TENANT_MODULE_IDS];
  }

  async getEnabledModuleIds(tenantId: string): Promise<string[]> {
    const row = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { enabledModuleIds: true },
    });
    return this.effectiveModuleIds(row?.enabledModuleIds);
  }

  async updateEnabledModuleIds(
    tenantId: string,
    body: { enabledModuleIds: string[] },
  ): Promise<{ enabledModuleIds: string[] }> {
    const next = normalizeTenantModuleIds(body.enabledModuleIds ?? []);
    if (next.length === 0) {
      throw new BadRequestException('Al menos un módulo debe estar activo');
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { enabledModuleIds: next },
    });

    await this.stripRolePermissionsForDisabledModules(tenantId, next);

    return { enabledModuleIds: next };
  }

  /** Quita de los roles permisos que ya no aplican por módulos desactivados. */
  private async stripRolePermissionsForDisabledModules(
    tenantId: string,
    enabledModuleIds: string[],
  ): Promise<void> {
    const roles = await this.prisma.role.findMany({
      where: { tenantId },
      select: { id: true, permissions: true },
    });
    for (const r of roles) {
      const filtered = filterPermissionsToEnabledModules(
        r.permissions,
        enabledModuleIds,
      );
      if (filtered.length !== r.permissions.length) {
        await this.prisma.role.update({
          where: { id: r.id },
          data: { permissions: filtered },
        });
      }
    }
  }
}
