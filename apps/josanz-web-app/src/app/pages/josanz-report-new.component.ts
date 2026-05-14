import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JOSANZ_FIGMA_DASHBOARD, JOSANZ_FIGMA_SHELL, JosanzThemeService } from '@josanz-erp/josanz-ui';

/** Asistente «Nuevo informe» (ruta `/reports/new`): plantilla operativa hasta conectar API. */
@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto flex max-w-2xl flex-col gap-8">
      <header>
        <a
          routerLink="/dashboard"
          class="mb-4 inline-flex text-[13px] font-semibold transition-[opacity] hover:opacity-80"
          [style.color]="theme.currentTheme().primaryColor"
        >
          ← Volver al panel
        </a>
        <h1 class="text-[26px] font-bold tracking-tight" [style.color]="theme.currentTheme().atmosphere.text">
          Nuevo informe
        </h1>
        <p class="mt-2 text-[14px] leading-relaxed" [style.color]="theme.currentTheme().atmosphere.textMuted">
          Elige alcance y formato. Los datos reales se enlazarán cuando el backend de informes esté activo.
        </p>
      </header>

      <ol class="flex flex-col gap-6" aria-label="Pasos">
        <li
          class="rounded-[8px] border border-solid p-5"
          [style.borderColor]="dash.widgetStroke"
          [style.backgroundColor]="theme.currentTheme().atmosphere.surface"
          [style.boxShadow]="shell.cardShadow"
        >
          <span class="text-[11px] font-bold uppercase tracking-wide" [style.color]="theme.currentTheme().atmosphere.textMuted"
            >Paso 1</span
          >
          <h2 class="mt-1 text-[16px] font-semibold" [style.color]="theme.currentTheme().atmosphere.text">Tipo de informe</h2>
          <div class="mt-4 flex flex-wrap gap-2">
            @for (t of reportTypes; track t) {
              <button
                type="button"
                class="h-9 rounded-[8px] border border-solid px-3 text-[12px] font-semibold transition-[background-color,color,border-color] duration-150"
                [style.borderColor]="selectedType() === t ? theme.currentTheme().primaryColor : dash.widgetStroke"
                [style.backgroundColor]="selectedType() === t ? shell.pillActiveBg : dash.surfaceMuted"
                [style.color]="selectedType() === t ? shell.pillActiveText : theme.currentTheme().atmosphere.textMuted"
                (click)="selectedType.set(t)"
              >
                {{ t }}
              </button>
            }
          </div>
        </li>

        <li
          class="rounded-[8px] border border-solid p-5"
          [style.borderColor]="dash.widgetStroke"
          [style.backgroundColor]="theme.currentTheme().atmosphere.surface"
          [style.boxShadow]="shell.cardShadow"
        >
          <span class="text-[11px] font-bold uppercase tracking-wide" [style.color]="theme.currentTheme().atmosphere.textMuted"
            >Paso 2</span
          >
          <h2 class="mt-1 text-[16px] font-semibold" [style.color]="theme.currentTheme().atmosphere.text">Periodo</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="flex flex-col gap-1 text-[12px] font-semibold" [style.color]="theme.currentTheme().atmosphere.textMuted">
              Desde
              <input
                type="date"
                class="h-10 rounded-[8px] border border-solid px-3 text-[13px] font-medium outline-none"
                [style.borderColor]="dash.widgetStroke"
                [style.color]="theme.currentTheme().atmosphere.text"
                [style.backgroundColor]="theme.currentTheme().atmosphere.surface"
              />
            </label>
            <label class="flex flex-col gap-1 text-[12px] font-semibold" [style.color]="theme.currentTheme().atmosphere.textMuted">
              Hasta
              <input
                type="date"
                class="h-10 rounded-[8px] border border-solid px-3 text-[13px] font-medium outline-none"
                [style.borderColor]="dash.widgetStroke"
                [style.color]="theme.currentTheme().atmosphere.text"
                [style.backgroundColor]="theme.currentTheme().atmosphere.surface"
              />
            </label>
          </div>
        </li>

        <li
          class="rounded-[8px] border border-solid p-5"
          [style.borderColor]="dash.widgetStroke"
          [style.backgroundColor]="theme.currentTheme().atmosphere.surface"
          [style.boxShadow]="shell.cardShadow"
        >
          <span class="text-[11px] font-bold uppercase tracking-wide" [style.color]="theme.currentTheme().atmosphere.textMuted"
            >Paso 3</span
          >
          <h2 class="mt-1 text-[16px] font-semibold" [style.color]="theme.currentTheme().atmosphere.text">Salida</h2>
          <div class="mt-4 flex flex-wrap gap-2">
            @for (f of formats; track f) {
              <button
                type="button"
                class="h-9 rounded-[8px] border border-solid px-3 text-[12px] font-semibold transition-[background-color,color,border-color] duration-150"
                [style.borderColor]="selectedFormat() === f ? theme.currentTheme().primaryColor : dash.widgetStroke"
                [style.backgroundColor]="selectedFormat() === f ? shell.pillActiveBg : dash.surfaceMuted"
                [style.color]="selectedFormat() === f ? shell.pillActiveText : theme.currentTheme().atmosphere.textMuted"
                (click)="selectedFormat.set(f)"
              >
                {{ f }}
              </button>
            }
          </div>
        </li>
      </ol>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="h-11 rounded-[8px] px-6 text-[13px] font-semibold text-white transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.99]"
          [style.backgroundColor]="dash.toolbarCta"
          (click)="onGenerate()"
        >
          Generar borrador
        </button>
        <a
          routerLink="/export"
          class="inline-flex h-11 items-center justify-center rounded-[8px] border border-solid px-6 text-[13px] font-semibold transition-[filter,transform] duration-150 hover:brightness-[0.97] active:scale-[0.99]"
          [style.borderColor]="dash.widgetStroke"
          [style.backgroundColor]="dash.headerFilterBg"
          [style.color]="theme.currentTheme().atmosphere.text"
        >
          Ir a exportaciones
        </a>
      </div>

      @if (message()) {
        <p class="text-[13px] font-medium" [style.color]="theme.currentTheme().atmosphere.textMuted">{{ message() }}</p>
      }
    </div>
  `,
})
export class JosanzReportNewComponent {
  readonly theme = inject(JosanzThemeService);
  readonly shell = JOSANZ_FIGMA_SHELL;
  readonly dash = JOSANZ_FIGMA_DASHBOARD;

  readonly reportTypes = ['Resumen ejecutivo', 'Ventas por cliente', 'Stock valorado', 'Cobros pendientes'] as const;
  readonly formats = ['PDF', 'XLSX'] as const;

  readonly selectedType = signal<string>(this.reportTypes[0]);
  readonly selectedFormat = signal<string>(this.formats[0]);
  readonly message = signal<string>('');

  onGenerate(): void {
    this.message.set(
      `Borrador preparado: ${this.selectedType()} · ${this.selectedFormat()} (demo sin servidor de informes).`,
    );
  }
}
