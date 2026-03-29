import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';
import { IdentityModule } from '@josanz-erp/identity-backend';
import { ClientsModule } from '@josanz-erp/clients-backend';
import { BudgetBackendModule } from '@josanz-erp/budget-backend';
import { ClsModule } from 'nestjs-cls';
import { InventoryModule } from '@josanz-erp/inventory-backend';
import { RentalsModule } from '@josanz-erp/rentals-backend';
import { DeliveryModule } from '@josanz-erp/delivery-backend';
import { BillingModule } from '@josanz-erp/billing-backend';
import { FleetModule } from '@josanz-erp/fleet-backend';
import { APP_GUARD } from '@nestjs/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { TenantGuard } from '@josanz-erp/shared-infrastructure';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tenantId = (req as any).headers['x-tenant-id'] as string;
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
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}
