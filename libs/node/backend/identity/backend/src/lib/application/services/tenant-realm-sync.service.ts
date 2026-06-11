import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantRealmSyncService {
  private readonly logger = new Logger(TenantRealmSyncService.name);
  private readonly keycloakUrl: string;
  private readonly clientId: string;
  private adminToken: string | null = null;

  private readonly MODULE_ROLE_MAP: Record<string, string[]> = {
    dashboard: ['dashboard.view'],
    clients: ['clients.view', 'clients.create', 'clients.edit', 'clients.delete'],
    products: ['products.view', 'products.manage'],
    budgets: ['budgets.view', 'budgets.create', 'budgets.approve'],
    rentals: ['rentals.view', 'rentals.approve'],
    users: ['users.manage'],
    roles: ['roles.manage'],
  };

  constructor(private readonly configService: ConfigService) {
    this.keycloakUrl = (configService.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://localhost:8080').replace(/\/$/, '');
    this.clientId = configService.get<string>('KEYCLOAK_RESOURCE') || 'josanz-erp-api';
  }

  async syncTenantModules(tenantId: string, enabledModuleIds: string[]): Promise<void> {
    const roles = this.mapModulesToClientRoles(enabledModuleIds);
    const tenantRealm = this.getTenantRealm(tenantId);
    await this.updateKeycloakClientRoles(tenantRealm, roles);
  }

  private getTenantRealm(tenantId: string): string {
    const realmBase = this.configService.get<string>('KEYCLOAK_TENANT_REALM_BASE') || 'josanz-web-app-realm';
    return realmBase;
  }

  mapModulesToClientRoles(moduleIds: string[]): string[] {
    const roles = new Set<string>();
    for (const moduleId of moduleIds) {
      const moduleRoles = this.MODULE_ROLE_MAP[moduleId];
      if (moduleRoles) {
        moduleRoles.forEach((role) => roles.add(role));
      }
    }
    return Array.from(roles);
  }

  async updateKeycloakClientRoles(realm: string, roles: string[]): Promise<void> {
    const token = await this.getAdminToken();
    if (!token) {
      this.logger.error('Failed to obtain Keycloak admin token');
      return;
    }

    const clientUuid = await this.getClientUuid(realm, token);
    if (!clientUuid) {
      this.logger.error(`Client not found in realm ${realm}`);
      return;
    }

    for (const roleName of roles) {
      await this.ensureClientRoleExists(realm, clientUuid, roleName, token);
    }

    this.logger.log(`Synced ${roles.length} client roles in realm ${realm}`);
  }

  async getAdminToken(): Promise<string | null> {
    if (this.adminToken) {
      return this.adminToken;
    }

    const adminClientId = this.configService.get<string>('KEYCLOAK_ADMIN_CLIENT_ID') || 'admin-cli';
    const adminUsername = this.configService.get<string>('KEYCLOAK_ADMIN_USER');
    const adminPassword = this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD');

    if (!adminUsername || !adminPassword) {
      this.logger.warn('Keycloak admin credentials not configured');
      return null;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('client_id', adminClientId);
      formData.append('username', adminUsername);
      formData.append('password', adminPassword);
      formData.append('scope', 'openid');

      const response = await fetch(
        `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to get admin token: ${response.status} ${errorText}`);
        return null;
      }

      const data = (await response.json()) as { access_token: string };
      this.adminToken = data.access_token;
      return this.adminToken;
    } catch (error) {
      this.logger.error(`Error getting admin token: ${error}`);
      return null;
    }
  }

  private async getClientUuid(realm: string, token: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/clients?clientId=${encodeURIComponent(this.clientId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        this.logger.error(`Failed to get client UUID: ${response.status}`);
        return null;
      }

      const clients = (await response.json()) as Array<{ id: string }>;
      return clients[0]?.id ?? null;
    } catch (error) {
      this.logger.error(`Error getting client UUID: ${error}`);
      return null;
    }
  }

  private async ensureClientRoleExists(
    realm: string,
    clientUuid: string,
    roleName: string,
    token: string,
  ): Promise<void> {
    try {
      const checkResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/clients/${clientUuid}/roles/${roleName}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (checkResponse.ok) {
        return;
      }

      const createResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/clients/${clientUuid}/roles`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: roleName,
            description: `Module role for ${roleName}`,
            composite: false,
          }),
        },
      );

      if (!createResponse.ok) {
        this.logger.error(`Failed to create client role ${roleName}: ${createResponse.status}`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring client role ${roleName}: ${error}`);
    }
  }
}