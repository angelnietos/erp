import { Component, inject } from '@angular/core'; // Re-syncing chunks
import { RouterModule } from '@angular/router';
import { PluginStore } from '@josanz-erp/shared-data-access';
import { AuthStore, ErpRouteThemeService } from '@josanz-erp/identity-data-access';

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
    inject(ErpRouteThemeService);
    // Fast initial render from cached JWT (may have stale tenant context)
    this.authStore.loadUserFromToken();
    // Defer plugin loading until session is refreshed - the APP_INITIALIZER handles this
  }
}
