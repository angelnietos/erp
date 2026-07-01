import { josanzAudiovisualRoutes, josanzEventsRoutes } from './lib.routes';

describe('josanz events routes', () => {
  it('registers catalog, create and detail entry points', () => {
    expect(josanzEventsRoutes.map((route) => route.path)).toEqual(['', 'new', ':id/edit', ':id']);
    const loadable = josanzEventsRoutes.filter((route) => route.path !== ':id/edit');
    expect(loadable.every((route) => typeof route.loadComponent === 'function')).toBe(true);
    expect(josanzEventsRoutes.find((route) => route.path === ':id/edit')?.redirectTo).toBe(':id');
  });

  it('registers audiovisual list entry points used by the app shell', () => {
    expect(josanzAudiovisualRoutes.map((route) => route.path)).toEqual([
      'equipment',
      'vehicles',
      'staff',
      'billing',
    ]);
    expect(josanzAudiovisualRoutes.every((route) => typeof route.loadComponent === 'function')).toBe(true);
  });
});
