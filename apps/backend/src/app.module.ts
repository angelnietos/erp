import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import {
  ClsTenantFromJwtInterceptor,
  SharedInfrastructureModule,
  TenantGuard,
} from '@josanz-erp/shared-infrastructure';
import { IdentityModule } from '@josanz-erp/identity-backend';
import { ClientsModule } from '@josanz-erp/clients-backend';
import { BudgetBackendModule } from '@josanz-erp/budget-backend';
import { ClsModule } from 'nestjs-cls';
import { InventoryModule } from '@josanz-erp/inventory-backend';
import { RentalsModule } from '@josanz-erp/rentals-backend';
import { DeliveryModule } from '@josanz-erp/delivery-backend';
import { BillingModule } from '@josanz-erp/billing-backend';
import { FleetModule } from '@josanz-erp/fleet-backend';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ReceiptsBackendModule } from '@josanz-erp/receipts-backend';
import { ProjectsBackendModule } from '@josanz-erp/projects-backend';
import { ServicesBackendModule } from '@josanz-erp/services-backend';
import { AnalyticsModule } from './analytics/analytics.module';
import { Phase3Module } from './phase3/phase3.module';
import { HealthModule } from './health/health.module';
import { ReportsExportModule } from './reports-export/reports-export.module';
import { AiInsightsModule } from './ai-insights/ai-insights.module';
import { TechniciansModule } from './technicians/technicians.module';
import { TimeOffModule } from './time-off/time-off.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
    // Shared infra
    SharedInfrastructureModule,
    // Business domains
    IdentityModule.forRoot(),
    ClientsModule.forRoot(),
    BudgetBackendModule.forRoot({ enableApprovalFlow: true }),
    InventoryModule.forRoot(),
    RentalsModule.forRoot(),
    DeliveryModule.forRoot(),
    BillingModule.forRoot(),
    FleetModule.forRoot(),
    ProjectsBackendModule,
    ServicesBackendModule,
    ReceiptsBackendModule,
    AnalyticsModule,
    Phase3Module,
    HealthModule,
    ReportsExportModule,
    AiInsightsModule,
    TechniciansModule,
    TimeOffModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClsTenantFromJwtInterceptor,
    },
  ],
})
export class AppModule {}
