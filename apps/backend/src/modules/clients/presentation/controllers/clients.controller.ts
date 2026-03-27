import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { JwtAuthGuard } from '../../../../shared/infrastructure/guards/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getClients() {
    return this.prisma.client.findMany({
      select: { id: true, name: true, sector: true }, 
    });
  }
}
