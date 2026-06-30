import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedInfrastructureModule, AuditInterceptor, PiiRedactionInterceptor } from '@josanz-erp/shared-infrastructure';
import { IdentityModule } from '@josanz-erp/identity-backend';
import { ClientsModule } from '@josanz-erp/clients-backend';
import { EventsBackendModule } from '@josanz-erp/events-backend';
import { BudgetBackendModule } from '@josanz-erp/budget-backend';
import { InventoryModule } from '@josanz-erp/inventory-backend';
import { RentalsModule } from '@josanz-erp/rentals-backend';
import { DeliveryModule } from '@josanz-erp/delivery-backend';
import { BillingModule } from '@josanz-erp/billing-backend';
import { FleetModule } from '@josanz-erp/fleet-backend';
import { ProjectsBackendModule } from '@josanz-erp/projects-backend';
import { ServicesBackendModule } from '@josanz-erp/services-backend';
import { ReceiptsBackendModule } from '@josanz-erp/receipts-backend';
import { AnalyticsModule } from './analytics/analytics.module';
import { Phase3Module } from './phase3/phase3.module';
import { HealthModule } from './health/health.module';
import { ReportsExportModule } from './reports-export/reports-export.module';
import { AiInsightsModule } from './ai-insights/ai-insights.module';
import { TechniciansModule } from './technicians/technicians.module';
import { TimeOffModule } from './time-off/time-off.module';
import { AuditModule } from './audit/audit.module';
import { PrivacyModule } from './privacy/privacy.module';
import { DocumentGeneratorBackendModule } from '@josanz-erp/document-generator-backend';
import { ClsModule } from 'nestjs-cls';
import { TenantGuard } from '@josanz-erp/shared-infrastructure';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
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
    SharedInfrastructureModule,
    IdentityModule.forRoot(),
    ClientsModule.forRoot(),
    EventsBackendModule.forRoot(),
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
    AuditModule,
    PrivacyModule,
    DocumentGeneratorBackendModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PiiRedactionInterceptor,
    },
  ],
})
export class AppModule {}
