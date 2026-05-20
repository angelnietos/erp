import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export function runCanActivateGuard(guard: CanActivateFn): ReturnType<CanActivateFn> {
  return TestBed.runInInjectionContext(() => guard({} as never, {} as never));
}

export function serializeGuardResult(result: boolean | UrlTree): boolean | string {
  if (typeof result === 'boolean') {
    return result;
  }
  return TestBed.inject(Router).serializeUrl(result);
}
