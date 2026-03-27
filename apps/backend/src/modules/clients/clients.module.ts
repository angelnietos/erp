import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { ClientsController } from './presentation/controllers/clients.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClientsController],
  providers: [],
  exports: [],
})
export class ClientsModule {}
