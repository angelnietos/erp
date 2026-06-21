import type { ActivatedRoute, Router } from '@angular/router';
import type { WritableSignal } from '@angular/core';

/** Sincroniza pestaña activa desde `?tab=` en rutas de detalle (página completa, no modal). */
export function readDetailTabFromRoute(
  route: ActivatedRoute,
  slugMap: Record<string, string>,
  tabs: readonly string[],
  activeTab: WritableSignal<string>,
): void {
  const tabSlug = route.snapshot.queryParamMap.get('tab');
  if (!tabSlug) {
    return;
  }
  const tab = Object.entries(slugMap).find(([, slug]) => slug === tabSlug)?.[0];
  if (tab && tabs.includes(tab)) {
    activeTab.set(tab);
  }
}

export function slugifyDetailTab(tab: string): string {
  return tab
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

/** Mapa tab → slug para `?tab=` a partir de las etiquetas visibles. */
export function buildTabSlugMap(tabs: readonly string[]): Record<string, string> {
  return Object.fromEntries(tabs.map((tab) => [tab, slugifyDetailTab(tab)]));
}

export function navigateDetailTab(
  router: Router,
  route: ActivatedRoute,
  tab: string,
  slugMap: Record<string, string>,
): void {
  const slug = slugMap[tab] ?? slugifyDetailTab(tab);
  void router.navigate([], {
    relativeTo: route,
    queryParams: { tab: slug },
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
}
