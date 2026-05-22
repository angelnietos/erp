import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';

/** Minimal shell so `routerLink` / `Router` exist (NavMenu and any routed stories). */
@Component({ standalone: true, template: '' })
class StorybookRouteStub {}

/**
 * Single catch-all route — enough for Storybook previews; links resolve and the app boots.
 */
export const storybookRouterDecorator = applicationConfig({
  providers: [provideRouter([{ path: '**', component: StorybookRouteStub }])],
});
