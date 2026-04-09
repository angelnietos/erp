import { AUDIT_BOT } from './audit.bot';
import { BUDGETS_BOT } from './budgets.bot';
import { BUDDY_BOT } from './buddy.bot';
import { CLIENTS_BOT } from './clients.bot';
import { DASHBOARD_BOT } from './dashboard.bot';
import { FLEET_BOT } from './fleet.bot';
import { INVENTORY_BOT } from './inventory.bot';
import { PROJECTS_BOT } from './projects.bot';
import { RENTALS_BOT } from './rentals.bot';

export const ALL_BOTS = {
  inventory: INVENTORY_BOT,
  budgets: BUDGETS_BOT,
  projects: PROJECTS_BOT,
  clients: CLIENTS_BOT,
  fleet: FLEET_BOT,
  rentals: RENTALS_BOT,
  audit: AUDIT_BOT,
  dashboard: DASHBOARD_BOT,
  buddy: BUDDY_BOT,
};

export * from './audit.bot';
export * from './budgets.bot';
export * from './buddy.bot';
export * from './clients.bot';
export * from './dashboard.bot';
export * from './fleet.bot';
export * from './inventory.bot';
export * from './projects.bot';
export * from './rentals.bot';
