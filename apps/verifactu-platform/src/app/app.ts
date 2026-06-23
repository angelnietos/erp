import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { SessionTokenStorageService } from '@generic-crm/shared-browser-data-access';
import { VerifactuPlatformShellComponent } from './layout/verifactu-platform-shell.component';

@Component({
  imports: [RouterModule, VerifactuPlatformShellComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly session = inject(SessionTokenStorageService);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0] ?? ''),
      startWith(this.router.url.split('?')[0] ?? ''),
    ),
    { initialValue: '' },
  );

  readonly showChrome = computed(() => {
    const path = this.url();
    if (!this.session.hasSession()) {
      return false;
    }
    return !path.startsWith('/login');
  });
}
