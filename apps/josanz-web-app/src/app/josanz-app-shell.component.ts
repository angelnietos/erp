import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  MobileTabBarComponent,
  SidebarComponent,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';
import { AuthStore } from '@josanz-erp/identity-data-access';

@Component({
  selector: 'app-josanz-shell',
  standalone: true,
  imports: [RouterModule, SidebarComponent, MobileTabBarComponent],
  templateUrl: './josanz-app-shell.component.html',
  styleUrl: './josanz-app-shell.component.css',
})
export class JosanzAppShellComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly josanzTheme = inject(JosanzThemeService);

  ngOnInit(): void {
    this.josanzTheme.setTheme('luxe-rounded');
  }

  onLogout(): void {
    this.authStore.logout();
  }
}
