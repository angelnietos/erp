export interface ClientSummary {
  id: string;
  name: string;
  sector: string | null;
}

export interface ClientsRepositoryPort {
  findAllSummaries(): Promise<ClientSummary[]>;
}

export const CLIENTS_REPOSITORY = Symbol('CLIENTS_REPOSITORY');

