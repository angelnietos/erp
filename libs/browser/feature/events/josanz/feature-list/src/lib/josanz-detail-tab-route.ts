import { ActivatedRoute, Router } from '@angular/router';
import { WritableSignal } from '@angular/core';

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

export function navigateDetailTab(
  router: Router,
  route: ActivatedRoute,
  tab: string,
  slugMap: Record<string, string>,
): void {
  const slug = slugMap[tab] ?? tab.toLowerCase().replace(/\s+/g, '-');
  void router.navigate([], {
    relativeTo: route,
    queryParams: { tab: slug },
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
}
