import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerifactuApiKeyGuard } from '../security/verifactu-api-key.guard';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

class CreateVerifactuSeriesDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

@Controller('verifactu/series')
@UseGuards(VerifactuApiKeyGuard)
export class VerifactuSeriesController {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  @Get(':tenantId')
  async list(@Param('tenantId') tenantId: string) {
    return (this.prisma as any).verifactuSeries.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@Body() dto: CreateVerifactuSeriesDto) {
    return (this.prisma as any).verifactuSeries.create({
      data: {
        tenantId: dto.tenantId,
        code: dto.code,
        description: dto.description,
      },
    });
  }
}

