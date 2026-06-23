import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { type ClientRowDto } from '@generic-crm/clients-api';
import { ClientsApiService } from '@generic-crm/clients-data-access';
import { httpApiErrorMessage } from '@generic-crm/shared-browser-data-access';
import {
  GcrmBadgeComponent,
  type GcrmBadgeVariant,
  GcrmButtonComponent,
  GcrmInlineMessageComponent,
  GcrmPageComponent,
  GcrmPanelComponent,
  GcrmSpinnerComponent,
} from '@generic-crm/shared-ui';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'lib-clients-home-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    GcrmBadgeComponent,
    GcrmButtonComponent,
    GcrmInlineMessageComponent,
    GcrmPageComponent,
    GcrmPanelComponent,
    GcrmSpinnerComponent,
  ],
  templateUrl: './clients-home-page.component.html',
  styleUrl: './clients-home-page.component.css',
})
export class ClientsHomePageComponent {
  private readonly clients = inject(ClientsApiService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly loadError = signal<string | null>(null);
  readonly listLoading = signal(false);

  readonly clients$ = this.refresh$.pipe(
    switchMap(() => {
      this.listLoading.set(true);
      this.loadError.set(null);
      return this.clients.list().pipe(
        map((rows) => (rows ?? []) as ClientRowDto[]),
        catchError((e: HttpErrorResponse) => {
          this.loadError.set(
            httpApiErrorMessage(e, 'No se pudieron cargar los clientes'),
          );
          return of([] as ClientRowDto[]);
        }),
        finalize(() => {
          this.listLoading.set(false);
        }),
      );
    }),
    startWith([] as ClientRowDto[]),
  );

  refresh(): void {
    this.loadError.set(null);
    this.refresh$.next();
  }

  typeBadge(type: string): GcrmBadgeVariant {
    const t = type.toLowerCase();
    if (t.includes('company') || t.includes('empresa')) return 'info';
    if (t.includes('person') || t.includes('particular')) return 'neutral';
    return 'neutral';
  }

  locationLabel(c: ClientRowDto): string {
    const parts = [c.city, c.country].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  }
}
