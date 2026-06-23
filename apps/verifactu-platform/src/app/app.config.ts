import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  API_BASE_URL,
  authBearerInterceptor,
} from '@generic-crm/shared-browser-data-access';
import { appRoutes } from './app.routes';
import { AppRuntimeConfig } from './runtime-config/app-runtime-config';

export function initAppRuntimeConfig(loader: AppRuntimeConfig) {
  return () => loader.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
    ),
    provideHttpClient(withInterceptors([authBearerInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initAppRuntimeConfig,
      deps: [AppRuntimeConfig],
      multi: true,
    },
    {
      provide: API_BASE_URL,
      useFactory: (loader: AppRuntimeConfig) => loader.apiBaseUrl,
      deps: [AppRuntimeConfig],
    },
  ],
};
