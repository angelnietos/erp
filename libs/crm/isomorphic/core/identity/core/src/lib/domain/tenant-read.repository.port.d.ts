export declare const TENANT_READ_REPOSITORY: unique symbol;
export interface TenantSummary {
    id: string;
    slug: string;
    name: string;
}
export interface TenantReadRepositoryPort {
    existsActiveById(id: string): Promise<boolean>;
    findActiveIdBySlug(slug: string): Promise<string | null>;
    findActiveSummaryById(id: string): Promise<TenantSummary | null>;
}
