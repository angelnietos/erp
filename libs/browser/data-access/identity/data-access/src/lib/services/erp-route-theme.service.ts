import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { syncErpRoutePhaseFromPath } from '../utils/erp-tenant-theme';

/** Sincroniza `data-erp-route` en `<html>` según la URL (auth vs app). */
@Injectable({ providedIn: 'root' })
export class ErpRouteThemeService {
  private readonly router = inject(Router);

  constructor() {
    syncErpRoutePhaseFromPath(this.router.url || '/');
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => syncErpRoutePhaseFromPath(event.urlAfterRedirects));
  }
}
