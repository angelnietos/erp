import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-xl flex flex-col gap-6">
      <h1 class="text-[28px] font-bold tracking-tight" [style.color]="theme.currentTheme().atmosphere.text">
        Ajustes
      </h1>
      <p class="text-[15px] leading-relaxed" [style.color]="theme.currentTheme().atmosphere.textMuted">
        Esta sección está en construcción. Usa el icono de personalización en la barra lateral para tema y
        colores.
      </p>
      <a
        routerLink="/dashboard"
        class="inline-flex w-fit rounded-xl px-4 py-2 text-[14px] font-semibold underline-offset-4 hover:underline"
        [style.color]="theme.currentTheme().primaryColor"
      >
        Volver al inicio
      </a>
    </div>
  `,
})
export class JosanzSettingsPlaceholderComponent {
  readonly theme = inject(JosanzThemeService);
}
