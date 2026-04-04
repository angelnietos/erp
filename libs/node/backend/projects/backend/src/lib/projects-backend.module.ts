import { Module } from '@nestjs/common';
import {
  OutboxModule,
  PrismaModule,
  SharedInfrastructureModule,
} from '@josanz-erp/shared-infrastructure';
import { ProjectsService } from './application/services/projects.service';
import { ProjectsController } from './presentation/controllers/projects.controller';
import { PROJECTS_REPOSITORY } from '@josanz-erp/projects-core';
import { PrismaProjectsRepository } from './infrastructure/repositories/prisma-projects.repository';

@Module({
  imports: [SharedInfrastructureModule, OutboxModule, PrismaModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: PROJECTS_REPOSITORY,
      useClass: PrismaProjectsRepository,
    },
  ],
  exports: [ProjectsService],
})
export class ProjectsBackendModule {}
