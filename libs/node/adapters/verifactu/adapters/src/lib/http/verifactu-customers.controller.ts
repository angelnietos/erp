import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerifactuApiKeyGuard } from '../security/verifactu-api-key.guard';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

class CreateVerifactuCustomerDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  taxId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;
}

@Controller('verifactu/customers')
@UseGuards(VerifactuApiKeyGuard)
export class VerifactuCustomersController {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  @Get(':tenantId')
  async list(@Param('tenantId') tenantId: string) {
    return (this.prisma as any).verifactuCustomer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@Body() dto: CreateVerifactuCustomerDto) {
    return (this.prisma as any).verifactuCustomer.create({
      data: {
        tenantId: dto.tenantId,
        taxId: dto.taxId,
        name: dto.name,
        email: dto.email,
        countryCode: dto.countryCode,
      },
    });
  }
}

