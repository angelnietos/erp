import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TenantModulesResponse {
  enabledModuleIds: string[];
}

@Injectable({ providedIn: 'root' })
export class TenantModulesApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/tenant/modules';

  fetchEnabledModules(): Observable<TenantModulesResponse> {
    return this.http.get<TenantModulesResponse>(this.url);
  }

  updateEnabledModules(
    enabledModuleIds: string[],
  ): Observable<TenantModulesResponse> {
    return this.http.put<TenantModulesResponse>(this.url, {
      enabledModuleIds,
    });
  }
}
