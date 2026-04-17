import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import { RoleType } from '@josanz-erp/identity-core';
import {
  DEFAULT_TENANT_MODULE_IDS,
  filterPermissionsToEnabledModules,
  normalizeTenantModuleIds,
} from '@josanz-erp/identity-api';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, tenantId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(tenantId: string, data: { name: string; description?: string; type: RoleType; permissions: string[] }) {
    const existing = await this.prisma.role.findFirst({
      where: { tenantId, name: data.name },
    });
    if (existing) throw new ConflictException('A role with this name already exists for this company');

    const mods = await this.resolveTenantEnabledModules(tenantId);
    const permissions = filterPermissionsToEnabledModules(data.permissions, mods);

    return this.prisma.role.create({
      data: {
        ...data,
        permissions,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, data: { name?: string; description?: string; permissions?: string[] }) {
    const current = await this.findById(id, tenantId);
    if (current.type === RoleType.SUPERADMIN) {
      throw new ForbiddenException('El rol SuperAdmin no se puede editar desde la aplicación');
    }

    if (data.name) {
      const existing = await this.prisma.role.findFirst({
        where: { tenantId, name: data.name, id: { not: id } },
      });
      if (existing) throw new ConflictException('A role with this name already exists');
    }

    let nextData = { ...data };
    if (data.permissions) {
      const mods = await this.resolveTenantEnabledModules(tenantId);
      nextData = {
        ...nextData,
        permissions: filterPermissionsToEnabledModules(data.permissions, mods),
      };
    }

    return this.prisma.role.update({
      where: { id },
      data: nextData,
    });
  }

  async delete(id: string, tenantId: string) {
    const role = await this.findById(id, tenantId);
    if (role.type === RoleType.SUPERADMIN) {
      throw new ForbiddenException('El rol SuperAdmin no se puede eliminar');
    }

    return this.prisma.role.delete({
      where: { id },
    });
  }

  async getPermissionsList() {
    // This could be dynamic based on discovered modules, but let's return a static list for now
    return [
      { id: 'dashboard.view', label: 'Ver Dashboard', group: 'General' },
      { id: 'clients.view', label: 'Ver Clientes', group: 'Clientes' },
      { id: 'clients.create', label: 'Crear Clientes', group: 'Clientes' },
      { id: 'clients.edit', label: 'Editar Clientes', group: 'Clientes' },
      { id: 'clients.delete', label: 'Eliminar Clientes', group: 'Clientes' },
      { id: 'products.view', label: 'Ver Inventario', group: 'Inventario' },
      { id: 'products.manage', label: 'Gestionar Inventario', group: 'Inventario' },
      { id: 'budgets.view', label: 'Ver Presupuestos', group: 'Facturación' },
      { id: 'budgets.create', label: 'Crear Presupuestos', group: 'Facturación' },
      { id: 'budgets.approve', label: 'Aprobar Presupuestos', group: 'Facturación' },
      { id: 'rentals.view', label: 'Ver Alquileres', group: 'Alquileres' },
      { id: 'rentals.approve', label: 'Aprobar Alquileres', group: 'Alquileres' },
      { id: 'users.manage', label: 'Gestionar Usuarios', group: 'Seguridad' },
      { id: 'roles.manage', label: 'Gestionar Roles', group: 'Seguridad' },
    ];
  }
}
