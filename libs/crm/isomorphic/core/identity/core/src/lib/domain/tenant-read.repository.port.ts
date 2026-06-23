export const TENANT_READ_REPOSITORY = Symbol('TENANT_READ_REPOSITORY');

export interface TenantReadRepositoryPort {
  existsActiveById(id: string): Promise<boolean>;
  findActiveIdBySlug(slug: string): Promise<string | null>;
}
