import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/** Catálogo accesible con x-tenant-id (TenantGuard global); sin JWT para alinear con analytics/demo. */
@ApiTags('services')
@Controller('services')
export class ServicesController {
  @Get()
  @ApiOperation({ summary: 'Listado del catálogo de servicios (demo)' })
  async findAll() {
    // Mock data for now
    return [
      {
        id: '1',
        name: 'Servicio de Streaming Básico',
        type: 'STREAMING',
        basePrice: 500,
        isActive: true,
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        name: 'Producción Audio/Video Completa',
        type: 'PRODUCCIÓN',
        basePrice: 2000,
        isActive: true,
        createdAt: '2024-01-02',
      },
    ];
  }

  @Post()
  async create(@Body() dto: any) {
    // Mock implementation
    return {
      id: Date.now().toString(),
      ...dto,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    // Mock implementation
    return {
      id,
      name: 'Servicio Demo',
      type: 'STREAMING',
      basePrice: 500,
      isActive: true,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    // Mock implementation
    return {
      id,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // Mock implementation
    return { success: true };
  }
}
