import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService, JosanzAtmosphereName } from '../services/theme.service';
import { ModalComponent } from './modal';
import { ButtonComponent } from './button';

@Component({
  selector: 'josanz-theme-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    <josanz-modal title="Personalización del Sistema" width="800px" (close)="modalClose.emit()">
      
      <div class="space-y-12 py-4">
        
        <!-- Branding Color -->
        <section>
          <h3 class="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Color de Marca (Branding)</h3>
          <div class="flex flex-wrap gap-4">
            @for (color of brandingColors; track color) {
              <button 
                (click)="themeService.setPrimaryColor(color)"
                [style.backgroundColor]="color"
                class="w-10 h-10 rounded-full border-4 transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer"
                [style.borderColor]="themeService.currentTheme().primaryColor === color ? 'white' : 'transparent'"
                [style.boxShadow]="themeService.currentTheme().primaryColor === color ? '0 0 0 2px ' + color : 'none'"
                [attr.aria-label]="'Seleccionar color ' + color"
              >
                <span class="sr-only">Color {{ color }}</span>
              </button>
            }
          </div>
        </section>

        <!-- Atmospheres -->
        <section>
          <h3 class="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Atmósfera del Entorno</h3>
          
          <div class="grid grid-cols-2 gap-6">
            <!-- Light Modes -->
            <div class="space-y-3">
              <span class="text-[11px] font-semibold text-slate-500">Modos Claros</span>
              <div class="grid grid-cols-5 gap-2">
                @for (atm of lightAtmospheres; track atm.name) {
                  <button 
                    (click)="themeService.setAtmosphere(atm.name)"
                    [style.backgroundColor]="themeService.atmosphereBackground(atm.name)"
                    [title]="atm.label"
                    class="h-12 rounded-lg border-2 transition-all hover:opacity-80 cursor-pointer shadow-sm"
                    [style.borderColor]="themeService.currentTheme().atmosphere.name === atm.name ? themeService.currentTheme().primaryColor : 'transparent'"
                    [attr.aria-label]="'Atmósfera ' + atm.label"
                  >
                    <span class="sr-only">{{ atm.label }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Dark Modes -->
            <div class="space-y-3">
              <span class="text-[11px] font-semibold text-slate-500">Modos Oscuros</span>
              <div class="grid grid-cols-5 gap-2">
                @for (atm of darkAtmospheres; track atm.name) {
                  <button 
                    (click)="themeService.setAtmosphere(atm.name)"
                    [style.backgroundColor]="themeService.atmosphereBackground(atm.name)"
                    [title]="atm.label"
                    class="h-12 rounded-lg border-2 transition-all hover:opacity-80 cursor-pointer shadow-lg"
                    [style.borderColor]="themeService.currentTheme().atmosphere.name === atm.name ? 'white' : 'transparent'"
                    [attr.aria-label]="'Atmósfera ' + atm.label"
                  >
                    <span class="sr-only">{{ atm.label }}</span>
                  </button>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- Visual Style -->
        <section>
          <h3 class="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Estilo Visual (Componentes)</h3>
          <div class="flex gap-4">
            <josanz-button 
              label="Modern (Rounded)" 
              [variant]="themeService.currentTheme().name === 'luxe-rounded' ? 'primary' : 'outline'"
              (btnClick)="themeService.setTheme('luxe-rounded')"
              shape="rounded"
            ></josanz-button>
            <josanz-button 
              label="Sharp (Square)" 
              [variant]="themeService.currentTheme().name === 'luxe-sharp' ? 'primary' : 'outline'"
              (btnClick)="themeService.setTheme('luxe-sharp')"
              shape="square"
            ></josanz-button>
            <josanz-button 
              label="Pill (Round)" 
              [variant]="themeService.currentTheme().name === 'luxe-pill' ? 'primary' : 'outline'"
              (btnClick)="themeService.setTheme('luxe-pill')"
              shape="pill"
            ></josanz-button>
          </div>
        </section>

      </div>

      <div footer-actions>
        <josanz-button label="Finalizar" variant="primary" (btnClick)="modalClose.emit()"></josanz-button>
      </div>

    </josanz-modal>
  `,
  styles: [`
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `]
})
export class ThemeModalComponent {
  public themeService = inject(JosanzThemeService);
  @Output() modalClose = new EventEmitter<void>();

  brandingColors = ['#635BFF', '#22C55E', '#F59E0B', '#EF4444', '#EC4899', '#222222', '#38BDF8', '#8B5CF6'];

  lightAtmospheres: { name: JosanzAtmosphereName; label: string }[] = [
    { name: 'luxe', label: 'Luxe' },
    { name: 'nature', label: 'Nature' },
    { name: 'ocean', label: 'Ocean' },
    { name: 'forest', label: 'Forest' },
    { name: 'sakura', label: 'Sakura' },
  ];

  darkAtmospheres: { name: JosanzAtmosphereName; label: string }[] = [
    { name: 'midnight', label: 'Midnight' },
    { name: 'cyberpunk', label: 'Cyber' },
    { name: 'industrial', label: 'Industrial' },
    { name: 'fire', label: 'Fire' },
    { name: 'sunset', label: 'Sunset' },
  ];
}
