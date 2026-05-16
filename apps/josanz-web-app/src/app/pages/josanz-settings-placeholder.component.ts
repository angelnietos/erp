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
        La personalización visual (colores, atmósferas, formas y tipo de paginación de listados) está en el
        icono de ajustes de la barra lateral: abre «Personalización Josanz» y elige la variante de paginación
        en «Paginación de listas».
      </p>
      <p class="text-[14px] leading-relaxed" [style.color]="theme.currentTheme().atmosphere.textMuted">
        Paginación actual:
        <strong [style.color]="theme.currentTheme().atmosphere.text">
          {{ theme.paginationVariant() === 'figma' ? 'Compacta (actual / total)' : 'Numerada' }}
        </strong>
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
