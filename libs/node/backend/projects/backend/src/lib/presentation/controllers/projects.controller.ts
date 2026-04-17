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
import { ProjectsService } from '../../application/services/projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
} from '../../application/dtos/create-project.dto';
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('clientId') clientId?: string) {
    return this.projectsService.getProjectsList(requireRequestTenantId(req), clientId);
  }

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(dto);
    return {
      id: project.id.value,
      name: project.name,
      status: project.status,
      createdAt: project.createdAt,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const project = await this.projectsService.findById(id);
    return project
      ? {
          id: project.id.value,
          tenantId: project.tenantId.value,
          name: project.name,
          description: project.description,
          status: project.status,
          startDate: project.startDate?.toISOString().split('T')[0],
          endDate: project.endDate?.toISOString().split('T')[0],
          clientId: project.clientId?.value,
          createdAt: project.createdAt.toISOString().split('T')[0],
        }
      : null;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const project = await this.projectsService.update(id, dto);
    return {
      id: project.id.value,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate?.toISOString().split('T')[0],
      endDate: project.endDate?.toISOString().split('T')[0],
      clientId: project.clientId?.value,
    };
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    const project = await this.projectsService.complete(id);
    return {
      id: project.id.value,
      status: project.status,
      message: 'Project completed successfully',
    };
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    const project = await this.projectsService.cancel(id);
    return {
      id: project.id.value,
      status: project.status,
      message: 'Project cancelled successfully',
    };
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    const duplicatedProject = await this.projectsService.duplicate(id);
    return {
      id: duplicatedProject.id.value,
      name: duplicatedProject.name,
      status: duplicatedProject.status,
      message: 'Project duplicated successfully',
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.projectsService.delete(id);
    return { success: true };
  }
}
