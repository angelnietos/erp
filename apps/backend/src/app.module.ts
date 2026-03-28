import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedInfrastructureModule } from './shared/infrastructure/shared-infrastructure.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ClientsModule } from './modules/clients/clients.module';
import { BudgetBackendModule } from '@josanz-erp/budget-backend';
import { ClsModule } from 'nestjs-cls';
import { InventoryModule } from './modules/inventory/inventory.module';
import { RentalsModule } from './modules/rentals/rentals.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { BillingModule } from './modules/billing/billing.module';
import { FleetModule } from './modules/fleet/fleet.module';

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
    IdentityModule,
    ClientsModule,
    BudgetBackendModule.forRoot({ enableApprovalFlow: true }),
    InventoryModule,
    RentalsModule,
    DeliveryModule,
    BillingModule,
    FleetModule,
  ],
})
export class AppModule {}
