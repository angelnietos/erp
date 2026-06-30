import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';
import { EventsController } from './infrastructure/http/events.controller';
import { EventsService } from './application/events.service';

@Module({})
export class EventsBackendModule {
  static forRoot(): DynamicModule {
    return {
      module: EventsBackendModule,
      imports: [PrismaModule],
      controllers: [EventsController],
      providers: [EventsService],
      exports: [EventsService],
    };
  }
}
