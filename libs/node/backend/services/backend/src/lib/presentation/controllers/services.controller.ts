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
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ServicesService } from '../../application/services/services.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
} from '../../application/dtos/create-service.dto';
import {
  JwtAuthGuard,
  requireRequestTenantId,
  requireRequestUserId,
} from '@josanz-erp/shared-infrastructure';

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
  async create(@Req() req: Request, @Body() dto: CreateServiceDto) {
    const service = await this.servicesService.create(dto, requireRequestUserId(req));
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
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const service = await this.servicesService.findById(id);
    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return {
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
    };
  }

  @Patch(':id/deactivate')
  async deactivate(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const service = await this.servicesService.deactivate(id, requireRequestUserId(req));
    return {
      id: service.id.value,
      isActive: service.isActive,
      message: 'Servicio desactivado correctamente',
    };
  }

  @Patch(':id/activate')
  async activate(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const service = await this.servicesService.activate(id, requireRequestUserId(req));
    return {
      id: service.id.value,
      isActive: service.isActive,
      message: 'Servicio activado correctamente',
    };
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    const service = await this.servicesService.update(
      id,
      dto,
      requireRequestUserId(req),
    );
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

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    await this.servicesService.delete(id, requireRequestUserId(req));
    return { success: true };
  }
}
