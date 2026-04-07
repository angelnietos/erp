import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { VerifactuApiKeyGuard } from '../security/verifactu-api-key.guard';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

@Controller('verifactu/records')
@UseGuards(VerifactuApiKeyGuard)
export class VerifactuRecordQueryController {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  @Get(':tenantId')
  async query(
    @Param('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.prisma.verifactuLog.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}

