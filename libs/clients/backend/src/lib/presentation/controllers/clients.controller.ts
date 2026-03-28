import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClientsService } from '@josanz-erp/clients-core';
import { JwtAuthGuard } from '../../../../shared/infrastructure/guards/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async getClients() {
    return this.clientsService.getClients();
  }
}
