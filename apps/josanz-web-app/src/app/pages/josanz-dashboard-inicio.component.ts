import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';

/** Pantalla Inicio alineada con el frame Figma (1280×832): accesos rápidos sin depender del ERP completo. */
@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl flex flex-col gap-8">
      <header>
        <h1
          class="text-[28px] font-bold tracking-tight"
          [style.color]="theme.currentTheme().atmosphere.text"
        >
          Inicio
        </h1>
        <p class="mt-2 text-[15px] leading-relaxed" [style.color]="theme.currentTheme().atmosphere.textMuted">
          Elige un módulo para continuar.
        </p>
      </header>
      <nav class="grid gap-4 sm:grid-cols-2">
        @for (item of links; track item.path) {
          <a
            [routerLink]="item.path"
            class="rounded-2xl border px-5 py-4 shadow-sm transition-[box-shadow,transform] hover:shadow-md active:scale-[0.99]"
            [style.borderColor]="'#E7EDF1'"
            [style.backgroundColor]="theme.currentTheme().atmosphere.surface"
            [style.color]="theme.currentTheme().atmosphere.text"
          >
            <span class="block text-[17px] font-semibold">{{ item.label }}</span>
            <span class="mt-1 block text-[13px]" [style.color]="theme.currentTheme().atmosphere.textMuted">{{
              item.hint
            }}</span>
          </a>
        }
      </nav>
    </div>
  `,
})
export class JosanzDashboardInicioComponent {
  readonly theme = inject(JosanzThemeService);

  readonly links = [
    { path: '/clients', label: 'Clientes', hint: 'Cartera y datos fiscales' },
    { path: '/users', label: 'Usuarios', hint: 'Accesos del sistema' },
    { path: '/delivery-notes', label: 'Albaranes', hint: 'Entregas y logística' },
    { path: '/budgets', label: 'Presupuestos', hint: 'Ofertas y propuestas' },
    { path: '/stock', label: 'Stock', hint: 'Productos y almacenes' },
  ] as const;
}
