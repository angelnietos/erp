import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TenantModulesResponse {
  enabledModuleIds: string[];
}

@Injectable({ providedIn: 'root' })
export class TenantModulesApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/tenant/modules';

  fetchEnabledModules(tenantId?: string): Observable<TenantModulesResponse> {
    let params = new HttpParams();
    if (tenantId) {
      params = params.set('tenantId', tenantId);
    }
    return this.http.get<TenantModulesResponse>(this.url, { params });
  }

  updateEnabledModules(enabledModuleIds: string[]): Observable<TenantModulesResponse> {
    return this.http.put<TenantModulesResponse>(this.url, {
      enabledModuleIds,
    });
  }
}
