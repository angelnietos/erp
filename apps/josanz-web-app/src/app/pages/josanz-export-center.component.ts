import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JOSANZ_FIGMA_DASHBOARD, JOSANZ_FIGMA_SHELL, JosanzThemeService } from '@josanz-erp/josanz-ui';

/** Centro de exportación (ruta `/export`): descargas CSV/XLSX/PDF desde datos del ERP. */
@Component({
  standalone: true,
  imports: [RouterLink],
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
        <h1 class="text-[26px] font-bold tracking-tight" [style.color]="theme.currentTheme().atmosphere.text">
          Exportar datos
        </h1>
        <p class="mt-2 text-[14px] leading-relaxed" [style.color]="theme.currentTheme().atmosphere.textMuted">
          Genera archivos listos para contabilidad, archivo o BI. Las descargas usan los filtros activos de cada
          módulo cuando aplica.
        </p>
      </header>

      <section class="flex flex-col gap-4" aria-label="Tipos de exportación">
        @for (row of exports; track row.id) {
          <div
            class="flex flex-col gap-4 rounded-[8px] border border-solid p-5 sm:flex-row sm:items-center sm:justify-between"
            [style.borderColor]="dash.widgetStroke"
            [style.backgroundColor]="theme.currentTheme().atmosphere.surface"
            [style.boxShadow]="shell.cardShadow"
          >
            <div class="min-w-0">
              <h2 class="text-[16px] font-semibold" [style.color]="theme.currentTheme().atmosphere.text">
                {{ row.title }}
              </h2>
              <p class="mt-1 text-[13px] leading-snug" [style.color]="theme.currentTheme().atmosphere.textMuted">
                {{ row.description }}
              </p>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-wide" [style.color]="theme.currentTheme().atmosphere.textMuted">
                {{ row.formats }}
              </p>
            </div>
            <div class="flex shrink-0 flex-wrap gap-2">
              <a
                [routerLink]="row.moduleLink"
                class="inline-flex h-10 items-center justify-center rounded-[8px] border border-solid px-4 text-[12px] font-semibold transition-[filter,transform] duration-150 hover:brightness-[0.97] active:scale-[0.99]"
                [style.borderColor]="dash.widgetStroke"
                [style.backgroundColor]="dash.surfaceMuted"
                [style.color]="theme.currentTheme().atmosphere.text"
              >
                Abrir módulo
              </a>
              <button
                type="button"
                class="inline-flex h-10 items-center justify-center rounded-[8px] px-4 text-[12px] font-semibold text-white transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.99]"
                [style.backgroundColor]="dash.toolbarCta"
                (click)="onDemoDownload(row.id)"
              >
                Descargar (demo)
              </button>
            </div>
          </div>
        }
      </section>
    </div>
  `,
})
export class JosanzExportCenterComponent {
  readonly theme = inject(JosanzThemeService);
  readonly shell = JOSANZ_FIGMA_SHELL;
  readonly dash = JOSANZ_FIGMA_DASHBOARD;

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
