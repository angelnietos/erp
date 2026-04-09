import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  // Determine if this route should be stored/cached when navigated away from.
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const url = this.getFullRouteUrl(route);
    
    // 1) ONLY cache if the route has an actual component (avoid infinite loops caching lazy parents)
    if (!route.routeConfig || !route.routeConfig.component) {
      return false;
    }

    // 2) Don't cache auth, new creations, edits, or empty strings
    if (url.includes('login') || url.includes('new') || url.includes('edit') || !url) {
      return false;
    }

    // 3) Don't cache detail pages
    if (Object.keys(route.params).length > 0) {
      return false;
    }

    // We only cache the root list components
    return true;
  }

  // Store the detached route handle in memory
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const url = this.getFullRouteUrl(route);
    if (handle) {
      this.storedRoutes.set(url, handle);
    } else {
      this.storedRoutes.delete(url);
    }
  }

  // Determine if this route should be retrieved from cache
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const url = this.getFullRouteUrl(route);
    return this.storedRoutes.has(url);
  }

  // Retrieve the cached route handle
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const url = this.getFullRouteUrl(route);
    return this.storedRoutes.get(url) || null;
  }

  // Determine if the route should be reused (Standard angular behavior)
  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  // Helper to build the full URL path string used as Cache Key
  private getFullRouteUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .map(v => v.url.map(segment => segment.path).join('/'))
      .filter(v => v.length > 0)
      .join('/');
  }
}
