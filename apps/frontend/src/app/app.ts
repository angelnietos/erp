import { Component, inject } from '@angular/core'; // Re-syncing chunks
import { RouterModule } from '@angular/router';
import { PluginStore } from '@josanz-erp/shared-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'frontend';
  private readonly authStore = inject(AuthStore);
  private readonly pluginStore = inject(PluginStore);

  constructor() {
    // Fast initial render from cached JWT (may have stale permissions)
    this.authStore.loadUserFromToken();
    this.pluginStore.loadFromStorage();

    // ALWAYS refresh from DB immediately – overwrites stale JWT permissions.
    // This runs async so the initial fast render above is not blocked.
    // The sidebar and guards will re-evaluate once this resolves.
    this.authStore.refreshSession();
  }
}
