import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import {
  ClsTenantFromJwtInterceptor,
  SharedInfrastructureModule,
  TenantGuard,
} from '@generic-crm/shared-infrastructure';
import { IdentityModule } from '@generic-crm/identity-backend';
import { ClientsModule } from '@generic-crm/clients-backend';
import { InvoicingModule } from '@generic-crm/invoicing-backend';
import { VerifactuModule } from '@generic-crm/verifactu-backend';
import { AppController } from './app.controller';
import { CrmDemoSeedBootstrap } from '../bootstrap/crm-demo-seed.bootstrap';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          const raw = req.headers['x-tenant-id'];
          if (typeof raw === 'string' && raw.trim()) {
            cls.set('tenantId', raw.trim());
          }
        },
      },
    }),
    SharedInfrastructureModule,
    IdentityModule,
    ClientsModule,
    InvoicingModule,
    VerifactuModule,
  ],
  controllers: [AppController],
  providers: [
    CrmDemoSeedBootstrap,
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}
