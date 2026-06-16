import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { apiOriginInterceptor } from './api-origin.interceptor';
import { platformAuthInterceptor } from './platform-auth.interceptor';
import { bffAuthInterceptor, provideEnterpriseAuth } from '@josanz-erp/shared-auth-keycloak';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideEnterpriseAuth({
      mode: environment.auth?.mode ?? 'legacy',
      apiPrefix: '/api',
    }),
    provideHttpClient(
      withInterceptors([
        apiOriginInterceptor,
        bffAuthInterceptor,
        platformAuthInterceptor,
      ]),
    ),
  ],
};
