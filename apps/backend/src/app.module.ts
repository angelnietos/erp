import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedInfrastructureModule } from './shared/infrastructure/shared-infrastructure.module';
import { IdentityModule } from '@josanz-erp/identity-backend';
import { ClientsModule } from '@josanz-erp/clients-backend';
import { BudgetBackendModule } from '@josanz-erp/budget-backend';
import { ClsModule } from 'nestjs-cls';
import { InventoryModule } from '@josanz-erp/inventory-backend';
import { RentalsModule } from '@josanz-erp/rentals-backend';
import { DeliveryModule } from '@josanz-erp/delivery-backend';
import { BillingModule } from '@josanz-erp/billing-backend';
import { FleetModule } from '@josanz-erp/fleet-backend';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  providers: [
    {
      provide: require('@nestjs/core').APP_GUARD,
      useClass: require('@josanz-erp/shared-infrastructure').TenantGuard,
    },
  ],
})
export class AppModule {}
