import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';

/** Centro de exportación (ruta `/export`): descargas CSV/XLSX/PDF desde datos del ERP. */
@Component({
  standalone: true,
  imports: [RouterLink, CardComponent, ButtonComponent],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <a
          routerLink="/dashboard"
          class="mb-4 inline-flex text-[13px] font-semibold transition-[opacity] hover:opacity-80"
          [style.color]="theme.currentTheme().primaryColor"
        >
          ← Volver al panel
        </a>
        <h1
          class="text-[26px] font-bold tracking-tight"
          [style.color]="theme.currentTheme().atmosphere.text"
        >
          Exportar datos
        </h1>
        <p
          class="mt-2 text-[14px] leading-relaxed"
          [style.color]="theme.currentTheme().atmosphere.textMuted"
        >
          Genera archivos listos para contabilidad, archivo o BI. Las descargas usan los filtros activos de
          cada módulo cuando aplica.
        </p>
      </header>

      <section class="flex flex-col gap-4" aria-label="Tipos de exportación">
        @for (row of exports; track row.id) {
          <josanz-card [title]="row.title" [subtitle]="row.description" [footerLabel]="row.formats">
            <div class="flex flex-wrap gap-2">
              <a [routerLink]="row.moduleLink" class="inline-flex">
                <josanz-button
                  label="Abrir módulo"
                  variant="outline"
                  [showIcon]="false"
                  size="sm"
                ></josanz-button>
              </a>
              <josanz-button
                label="Descargar (demo)"
                variant="primary"
                [showIcon]="false"
                size="sm"
                (btnClick)="onDemoDownload(row.id)"
              ></josanz-button>
            </div>
          </josanz-card>
        }
      </section>
    </div>
  `,
})
export class JosanzExportCenterComponent {
  readonly theme = inject(JosanzThemeService);

  readonly exports = [
    {
      id: 'clients',
      title: 'Cartera de clientes',
      description: 'Razón social, NIF, dirección y contacto para importar en Excel o CRM.',
      formats: 'CSV · XLSX',
      moduleLink: '/clients',
    },
    {
      id: 'budgets',
      title: 'Presupuestos',
      description: 'Líneas de presupuesto con importes e IVA para revisión o envío al cliente.',
      formats: 'XLSX · PDF',
      moduleLink: '/budgets',
    },
    {
      id: 'delivery',
      title: 'Albaranes de entrega',
      description: 'Histórico de albaranes con fechas y referencias para logística y facturación.',
      formats: 'CSV · PDF',
      moduleLink: '/delivery-notes',
    },
    {
      id: 'stock',
      title: 'Inventario y stock',
      description: 'Existencias por almacén y referencia para cuadres de inventario.',
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
