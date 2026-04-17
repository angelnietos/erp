import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ServicesService } from '../../application/services/services.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
} from '../../application/dtos/create-service.dto';
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('type') type?: string) {
    return this.servicesService.getServicesList(requireRequestTenantId(req), type);
  }

  @Get('active')
  async findActive(@Req() req: Request, @Query('type') type?: string) {
    const services = await this.servicesService.findActive(requireRequestTenantId(req), type);
    return services.map((service) => ({
      id: service.id.value,
      tenantId: service.tenantId.value,
      name: service.name,
      description: service.description,
      type: service.type,
      basePrice: service.basePrice,
      hourlyRate: service.hourlyRate,
      configuration: service.configuration,
      isActive: service.isActive,
      createdAt: service.createdAt.toISOString().split('T')[0],
      updatedAt: service.updatedAt?.toISOString().split('T')[0],
    }));
  }

  @Post()
  async create(@Body() dto: CreateServiceDto) {
    const service = await this.servicesService.create(dto);
    return {
      id: service.id.value,
      name: service.name,
      type: service.type,
      basePrice: service.basePrice,
      isActive: service.isActive,
      createdAt: service.createdAt,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const service = await this.servicesService.findById(id);
    return service
      ? {
          id: service.id.value,
          tenantId: service.tenantId.value,
          name: service.name,
          description: service.description,
          type: service.type,
          basePrice: service.basePrice,
          hourlyRate: service.hourlyRate,
          configuration: service.configuration,
          isActive: service.isActive,
          createdAt: service.createdAt.toISOString().split('T')[0],
          updatedAt: service.updatedAt?.toISOString().split('T')[0],
        }
      : null;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    const service = await this.servicesService.update(id, dto);
    return {
      id: service.id.value,
      name: service.name,
      description: service.description,
      type: service.type,
      basePrice: service.basePrice,
      hourlyRate: service.hourlyRate,
      configuration: service.configuration,
      isActive: service.isActive,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    const service = await this.servicesService.deactivate(id);
    return {
      id: service.id.value,
      isActive: service.isActive,
      message: 'Service deactivated successfully',
    };
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    const service = await this.servicesService.activate(id);
    return {
      id: service.id.value,
      isActive: service.isActive,
      message: 'Service activated successfully',
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.servicesService.delete(id);
    return { success: true };
  }
}
