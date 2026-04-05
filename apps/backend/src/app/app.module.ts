import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsBackendModule } from '@josanz-erp/events-backend';
import { ProjectsBackendModule } from '@josanz-erp/projects-backend';
import { ServicesBackendModule } from '@josanz-erp/services-backend';
import { ReceiptsBackendModule } from '@josanz-erp/receipts-backend';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          const tenantId = req.headers['x-tenant-id'] as string;
          if (tenantId) {
            cls.set('tenantId', tenantId);
          }
        },
      },
    }),
    EventsBackendModule,
    ProjectsBackendModule,
    ServicesBackendModule,
    ReceiptsBackendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
