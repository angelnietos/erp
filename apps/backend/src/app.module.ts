import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ClientsModule } from './modules/clients/clients.module';
import { BudgetModule } from './modules/budget/budget.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { RentalsModule } from './modules/rentals/rentals.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { BillingModule } from './modules/billing/billing.module';
import { FleetModule } from './modules/fleet/fleet.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),
    // Shared infra
    PrismaModule,
    // Business domains
    IdentityModule,
    ClientsModule,
    BudgetModule,
    InventoryModule,
    RentalsModule,
    DeliveryModule,
    BillingModule,
    FleetModule,
  ],
})
export class AppModule {}
