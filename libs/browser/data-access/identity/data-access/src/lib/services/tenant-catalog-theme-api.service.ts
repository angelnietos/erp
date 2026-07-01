import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { TenantCatalogTheme } from '@josanz-erp/josanz-ui';

@Injectable({ providedIn: 'root' })
export class TenantCatalogThemeApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/tenant/catalog-theme';

  fetchCatalogTheme(): Observable<TenantCatalogTheme> {
    return this.http.get<TenantCatalogTheme>(this.url);
  }

  updateCatalogTheme(theme: TenantCatalogTheme): Observable<TenantCatalogTheme> {
    return this.http.put<TenantCatalogTheme>(this.url, theme);
  }
}
