import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MobileTabBarComponent, SidebarComponent } from '@josanz-erp/josanz-ui';

@Component({
  imports: [RouterModule, SidebarComponent, MobileTabBarComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'josanz-web-app';
}
