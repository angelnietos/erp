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

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  @Get()
  async findAll() {
    // Mock data for now
    return [
      {
        id: '1',
        name: 'Proyecto Demo 1',
        description: 'Descripción del proyecto demo',
        status: 'ACTIVE',
        createdAt: '2024-01-01',
      },
    ];
  }

  @Post()
  async create(@Body() dto: any) {
    // Mock implementation
    return {
      id: Date.now().toString(),
      ...dto,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    // Mock implementation
    return {
      id,
      name: 'Proyecto Demo',
      status: 'ACTIVE',
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
