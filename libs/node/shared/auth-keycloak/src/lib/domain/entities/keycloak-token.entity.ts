import { Injectable } from '@nestjs/common';

export interface KeycloakToken {
  sub: string;
  email: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles: string[] };
  client_roles?: Record<string, string[]>;
  tenant_id?: string;
  scope?: string;
  iss?: string;
}

export interface ErpMappedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
}