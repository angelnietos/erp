import { josanzAudiovisualRoutes, josanzEventsRoutes } from './lib.routes';

describe('josanz events routes', () => {
  it('registers catalog, create and detail entry points', () => {
    expect(josanzEventsRoutes.map((route) => route.path)).toEqual(['', 'new', ':id']);
    expect(josanzEventsRoutes.every((route) => typeof route.loadComponent === 'function')).toBe(true);
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
