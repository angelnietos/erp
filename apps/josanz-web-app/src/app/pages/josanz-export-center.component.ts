import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  JosanzThemeService,
  SecondaryButtonComponent,
} from '@josanz-erp/josanz-ui';

/** Centro de exportación (ruta `/export`): descargas CSV/XLSX/PDF desde datos del ERP. */
@Component({
  standalone: true,
  imports: [RouterLink, ButtonComponent, SecondaryButtonComponent],
  template: `
    <div class="josanz-export-center mx-auto flex w-full max-w-4xl flex-col gap-6 pb-8">
      <header class="josanz-export-center__header">
        <a routerLink="/dashboard" class="josanz-export-center__back">← Volver al panel</a>
        <h1 class="josanz-export-center__title">Exportar datos</h1>
        <p class="josanz-export-center__desc">
          Genera archivos listos para contabilidad, archivo o BI. Las descargas usan los filtros activos de
          cada módulo cuando aplica.
        </p>
      </header>

      <div class="josanz-catalog-summary" role="group" aria-label="Resumen exportaciones">
        <span class="josanz-catalog-summary__item josanz-catalog-summary__item--active">Total</span>
        <span class="josanz-catalog-summary__item">Formatos <strong>CSV · XLSX · PDF</strong></span>
        <span class="josanz-catalog-summary__item">Módulos <strong>{{ exports.length }}</strong></span>
      </div>

      <section class="flex flex-col gap-3" aria-label="Tipos de exportación">
        @for (row of exports; track row.id) {
          <article class="josanz-event-budget-line josanz-export-center__row">
            <span>
              <span class="josanz-event-budget-line__name">{{ row.title }}</span>
              <span class="josanz-event-budget-line__warehouse"> · {{ row.description }}</span>
            </span>
            <span class="josanz-export-center__formats">{{ row.formats }}</span>
            <span class="josanz-export-center__actions">
              <a [routerLink]="row.moduleLink" class="inline-flex">
                <josanz-secondary-button label="Abrir"></josanz-secondary-button>
              </a>
              <josanz-button
                label="Descargar"
                variant="primary"
                [showIcon]="false"
                size="sm"
                (btnClick)="onDemoDownload(row.id)"
              ></josanz-button>
            </span>
          </article>
        }
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .josanz-export-center__header {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .josanz-export-center__back {
        font-size: 13px;
        font-weight: 600;
        color: var(--josanz-primary);
        width: fit-content;
      }

      .josanz-export-center__title {
        font-size: clamp(26px, 4vw, 30px);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--josanz-text);
      }

      .josanz-export-center__desc {
        font-size: 14px;
        line-height: 1.55;
        color: var(--josanz-text-muted);
        max-width: 640px;
      }

      .josanz-export-center__row {
        align-items: center;
        gap: 12px;
      }

      .josanz-export-center__formats {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--josanz-text-muted);
        white-space: nowrap;
      }

      .josanz-export-center__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      @media (max-width: 767px) {
        .josanz-export-center__row {
          flex-direction: column;
          align-items: flex-start;
        }

        .josanz-export-center__actions {
          width: 100%;
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class JosanzExportCenterComponent {
  readonly theme = inject(JosanzThemeService);

  readonly exports = [
    {
      id: 'clients',
      title: 'Cartera de clientes',
      description: 'Razón social, NIF, dirección y contacto.',
      formats: 'CSV · XLSX',
      moduleLink: '/clients',
    },
    {
      id: 'budgets',
      title: 'Presupuestos',
      description: 'Líneas con importes e IVA.',
      formats: 'XLSX · PDF',
      moduleLink: '/budgets',
    },
    {
      id: 'delivery',
      title: 'Albaranes de entrega',
      description: 'Histórico con fechas y referencias.',
      formats: 'CSV · PDF',
      moduleLink: '/delivery-notes',
    },
    {
      id: 'stock',
      title: 'Inventario y stock',
      description: 'Existencias por almacén y referencia.',
      formats: 'XLSX',
      moduleLink: '/stock',
    },
  ] as const;

  onDemoDownload(id: string): void {
    const blob = new Blob(
      [`Export demo Josanz ERP — ${id} — ${new Date().toISOString()}\n`],
      { type: 'text/plain;charset=utf-8' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `josanz-export-${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
