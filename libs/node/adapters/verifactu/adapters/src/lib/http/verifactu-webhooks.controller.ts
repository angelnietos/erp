import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { VerifactuApiKeyGuard } from '../security/verifactu-api-key.guard';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

class CreateWebhookEndpointDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsNotEmpty()
  secret!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@Controller('verifactu/webhooks')
@UseGuards(VerifactuApiKeyGuard)
export class VerifactuWebhooksController {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  @Get(':tenantId')
  async list(@Param('tenantId') tenantId: string) {
    return this.prisma.verifactuWebhookEndpoint.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@Body() dto: CreateWebhookEndpointDto) {
    return this.prisma.verifactuWebhookEndpoint.create({
      data: {
        tenantId: dto.tenantId,
        eventType: dto.eventType,
        url: dto.url,
        secret: dto.secret,
        isActive: dto.isActive ?? true,
      },
    });
  }

  @Delete(':endpointId')
  async remove(@Param('endpointId') endpointId: string) {
    await this.prisma.verifactuWebhookEndpoint.delete({ where: { id: endpointId } });
    return { deleted: true, endpointId };
  }
}

