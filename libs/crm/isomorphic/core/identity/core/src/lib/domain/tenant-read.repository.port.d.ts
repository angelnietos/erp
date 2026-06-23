export declare const TENANT_READ_REPOSITORY: unique symbol;
export interface TenantReadRepositoryPort {
    existsActiveById(id: string): Promise<boolean>;
    findActiveIdBySlug(slug: string): Promise<string | null>;
}
