import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  MobileTabBarComponent,
  SidebarComponent,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';
import { JosanzDemoAuthService } from './auth/josanz-demo-auth.service';

@Component({
  selector: 'app-josanz-shell',
  standalone: true,
  imports: [RouterModule, SidebarComponent, MobileTabBarComponent],
  templateUrl: './josanz-app-shell.component.html',
  styleUrl: './josanz-app-shell.component.css',
})
export class JosanzAppShellComponent implements OnInit {
  private readonly auth = inject(JosanzDemoAuthService);
  private readonly router = inject(Router);
  private readonly josanzTheme = inject(JosanzThemeService);

  ngOnInit(): void {
    this.josanzTheme.setTheme('luxe-rounded');
  }

  onLogout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
