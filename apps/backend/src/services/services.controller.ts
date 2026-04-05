import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../shared/infrastructure/guards/jwt-auth.guard';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  @Get()
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
