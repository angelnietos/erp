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
    this.authStore.loadUserFromToken();
    this.pluginStore.loadFromStorage();
    
    // Background refresh to ensure permissions are up to date with DB state
    if (this.authStore.isAuthenticated()) {
      this.authStore.refreshSession();
    }
  }
}
