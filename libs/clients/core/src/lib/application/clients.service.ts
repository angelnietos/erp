import { Inject, Injectable } from '@nestjs/common';
import { CLIENTS_REPOSITORY, ClientsRepositoryPort, ClientSummary } from '../domain/ports/clients.repository.port';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENTS_REPOSITORY) private readonly repository: ClientsRepositoryPort,
  ) {}

  getClients(): Promise<ClientSummary[]> {
    return this.repository.findAllSummaries();
  }
}

