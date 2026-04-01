import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
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

  constructor() {
    this.authStore.loadUserFromToken();
  }
}
