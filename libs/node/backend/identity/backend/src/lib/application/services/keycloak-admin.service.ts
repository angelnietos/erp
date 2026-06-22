import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface KeycloakUserSummary {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private readonly keycloakUrl: string;
  private adminToken: string | null = null;

  constructor(private readonly configService: ConfigService) {
    this.keycloakUrl = (
      configService.get<string>('KEYCLOAK_AUTH_SERVER_URL') ||
      'http://localhost:8081'
    ).replace(/\/$/, '');
  }

  isConfigured(): boolean {
    return Boolean(
      this.configService.get<string>('KEYCLOAK_ADMIN_USER') &&
        this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD'),
    );
  }

  async getAdminToken(): Promise<string | null> {
    if (this.adminToken) {
      return this.adminToken;
    }

    const adminClientId =
      this.configService.get<string>('KEYCLOAK_ADMIN_CLIENT_ID') || 'admin-cli';
    const adminUsername = this.configService.get<string>('KEYCLOAK_ADMIN_USER');
    const adminPassword =
      this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD');

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
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Failed to get admin token: ${response.status} ${errorText}`,
        );
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

  async getClientUuid(
    realm: string,
    clientId: string,
    token?: string,
  ): Promise<string | null> {
    const auth = token ?? (await this.getAdminToken());
    if (!auth) return null;

    try {
      const response = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/clients?clientId=${encodeURIComponent(clientId)}`,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
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

  async ensureClientRole(
    realm: string,
    clientUuid: string,
    roleName: string,
    token?: string,
  ): Promise<boolean> {
    const auth = token ?? (await this.getAdminToken());
    if (!auth) return false;

    try {
      const checkResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/clients/${clientUuid}/roles/${encodeURIComponent(roleName)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (checkResponse.ok) {
        return true;
      }

      const createResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/clients/${clientUuid}/roles`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: roleName,
            description: `Synced role ${roleName}`,
            composite: false,
          }),
        },
      );

      if (!createResponse.ok) {
        this.logger.error(
          `Failed to create client role ${roleName}: ${createResponse.status}`,
        );
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(`Error ensuring client role ${roleName}: ${error}`);
      return false;
    }
  }

  async findUserByEmail(
    realm: string,
    email: string,
    token?: string,
  ): Promise<KeycloakUserSummary | null> {
    const auth = token ?? (await this.getAdminToken());
    if (!auth) return null;

    const normalized = email.trim().toLowerCase();
    try {
      const response = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(normalized)}&exact=true`,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const users = (await response.json()) as KeycloakUserSummary[];
      return users.find((u) => u.email?.toLowerCase() === normalized) ?? null;
    } catch (error) {
      this.logger.error(`Error finding KC user ${email}: ${error}`);
      return null;
    }
  }

  async createUser(
    realm: string,
    data: {
      email: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
      enabled?: boolean;
    },
    token?: string,
  ): Promise<string | null> {
    const auth = token ?? (await this.getAdminToken());
    if (!auth) return null;

    const email = data.email.trim().toLowerCase();
    try {
      const createResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/users`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: data.username ?? email,
            email,
            firstName: data.firstName,
            lastName: data.lastName,
            enabled: data.enabled ?? true,
            emailVerified: true,
          }),
        },
      );

      if (createResponse.status !== 201) {
        this.logger.error(`Failed to create KC user: ${createResponse.status}`);
        return null;
      }

      const location = createResponse.headers.get('Location');
      const userId = location?.split('/').pop() ?? null;

      if (userId && data.password) {
        await this.setUserPassword(realm, userId, data.password, auth);
      }

      return userId;
    } catch (error) {
      this.logger.error(`Error creating KC user: ${error}`);
      return null;
    }
  }

  async setUserPassword(
    realm: string,
    userId: string,
    password: string,
    token?: string,
  ): Promise<boolean> {
    const auth = token ?? (await this.getAdminToken());
    if (!auth) return false;

    try {
      const response = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/users/${userId}/reset-password`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'password',
            value: password,
            temporary: false,
          }),
        },
      );
      return response.ok;
    } catch (error) {
      this.logger.error(`Error setting KC password: ${error}`);
      return false;
    }
  }

  async updateUserProfile(
    realm: string,
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      enabled?: boolean;
    },
    token?: string,
  ): Promise<boolean> {
    const auth = token ?? (await this.getAdminToken());
    if (!auth) return false;

    try {
      const response = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );
      return response.ok;
    } catch (error) {
      this.logger.error(`Error updating KC user: ${error}`);
      return false;
    }
  }

  async assignRealmRoles(
    realm: string,
    userId: string,
    roleNames: string[],
    token?: string,
  ): Promise<boolean> {
    const auth = token ?? (await this.getAdminToken());
    if (!auth || roleNames.length === 0) return false;

    try {
      const rolesResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/roles`,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!rolesResponse.ok) return false;

      const allRoles = (await rolesResponse.json()) as Array<{
        id: string;
        name: string;
      }>;
      const toAssign = allRoles.filter((r) => roleNames.includes(r.name));
      if (toAssign.length === 0) return false;

      const assignResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(toAssign),
        },
      );
      return assignResponse.ok;
    } catch (error) {
      this.logger.error(`Error assigning realm roles: ${error}`);
      return false;
    }
  }

  async getUserClientRoles(
    realm: string,
    userId: string,
    clientUuid: string,
    token?: string,
  ): Promise<string[]> {
    const auth = token ?? (await this.getAdminToken());
    if (!auth) return [];

    try {
      const response = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/clients/${clientUuid}`,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) return [];

      const roles = (await response.json()) as Array<{ name: string }>;
      return roles.map((r) => r.name);
    } catch (error) {
      this.logger.error(`Error reading client roles: ${error}`);
      return [];
    }
  }

  async setUserClientRoles(
    realm: string,
    userId: string,
    clientUuid: string,
    roleNames: string[],
    token?: string,
  ): Promise<boolean> {
    const auth = token ?? (await this.getAdminToken());
    if (!auth) return false;

    try {
      const current = await this.getUserClientRoles(
        realm,
        userId,
        clientUuid,
        auth,
      );

      const availableResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/clients/${clientUuid}/roles`,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!availableResponse.ok) return false;

      const available = (await availableResponse.json()) as Array<{
        id: string;
        name: string;
      }>;
      const availableMap = new Map(available.map((r) => [r.name, r]));

      const toRemove = available.filter((r) => current.includes(r.name));
      if (toRemove.length > 0) {
        await fetch(
          `${this.keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/clients/${clientUuid}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${auth}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(toRemove),
          },
        );
      }

      const toAdd = roleNames
        .map((name) => availableMap.get(name))
        .filter((r): r is { id: string; name: string } => Boolean(r));

      if (toAdd.length === 0) {
        return true;
      }

      const assignResponse = await fetch(
        `${this.keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/clients/${clientUuid}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(toAdd),
        },
      );
      return assignResponse.ok;
    } catch (error) {
      this.logger.error(`Error setting client roles: ${error}`);
      return false;
    }
  }
}
