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
    <josanz-modal title="Personalización Josanz" width="min(900px, 95vw)" (close)="modalClose.emit()">
      
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 py-4">
        
        <!-- Left Column: Branding & Shapes -->
        <div class="w-full lg:w-[300px] space-y-10 lg:space-y-12">
          <section>
            <h3 class="premium-label">Color de Marca</h3>
            <p class="premium-desc">Define la identidad visual primaria del ERP.</p>
            <div class="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-3 mt-6">
              @for (color of brandingColors; track color) {
                <button 
                  (click)="themeService.setPrimaryColor(color)"
                  [style.backgroundColor]="color"
                  class="w-full aspect-square rounded-xl border-4 transition-all hover:scale-110 active:scale-90 shadow-lg cursor-pointer relative"
                  [style.borderColor]="themeService.currentTheme().primaryColor === color ? 'white' : 'transparent'"
                  [style.boxShadow]="themeService.currentTheme().primaryColor === color ? '0 0 15px ' + color : 'none'"
                >
                  @if (themeService.currentTheme().primaryColor === color) {
                    <div class="absolute inset-0 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  }
                </button>
              }
            </div>
          </section>

          <section>
            <h3 class="premium-label">Estilo de Formas</h3>
            <p class="premium-desc">Geometría de botones y contenedores.</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col gap-3 mt-6">
              <button 
                (click)="themeService.setTheme('luxe-rounded')"
                class="shape-selector shape-selector--rounded"
                [class.active]="themeService.currentTheme().name === 'luxe-rounded'"
              >
                <div class="w-8 h-8 rounded-lg bg-[var(--josanz-primary)]"></div>
                <span>Modern Rounded</span>
              </button>
              <button 
                (click)="themeService.setTheme('luxe-pill')"
                class="shape-selector shape-selector--pill"
                [class.active]="themeService.currentTheme().name === 'luxe-pill'"
              >
                <div class="w-8 h-8 rounded-full bg-[var(--josanz-primary)]"></div>
                <span>Premium Pill</span>
              </button>
              <button 
                (click)="themeService.setTheme('luxe-sharp')"
                class="shape-selector shape-selector--sharp"
                [class.active]="themeService.currentTheme().name === 'luxe-sharp'"
              >
                <div class="w-8 h-8 rounded-none bg-[var(--josanz-primary)]"></div>
                <span>Classic Sharp</span>
              </button>
            </div>
          </section>
        </div>

        <!-- Right Columns: Atmospheres -->
        <div class="flex-1 space-y-10 lg:space-y-12">
          <section>
            <h3 class="premium-label">Atmósferas Visuales</h3>
            <p class="premium-desc">Cambia radicalmente el entorno de trabajo.</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
              @for (atm of allAtmospheres; track atm.name) {
                <button 
                  (click)="themeService.setAtmosphere(atm.name)"
                  class="atmosphere-card group"
                  [class.active]="themeService.currentTheme().atmosphere.name === atm.name"
                  [style.backgroundColor]="themeService.atmosphereBackground(atm.name)"
                >
                  <div class="atmosphere-preview">
                     <div class="preview-line w-1/2"></div>
                     <div class="preview-line w-3/4 opacity-50"></div>
                     <div class="preview-dot" [style.backgroundColor]="'var(--josanz-accent)'"></div>
                  </div>
                  <div class="mt-auto flex items-center justify-between w-full">
                    <span class="font-bold text-[14px]">{{ atm.label }}</span>
                    @if (themeService.currentTheme().atmosphere.name === atm.name) {
                      <div class="w-2 h-2 rounded-full bg-[var(--josanz-accent)] glow-accent"></div>
                    }
                  </div>
                </button>
              }
            </div>
          </section>
        </div>

      </div>

      <div footer-actions class="w-full flex justify-end">
        <josanz-button label="Aplicar Cambios" variant="primary" size="lg" (btnClick)="modalClose.emit()"></josanz-button>
      </div>

    </josanz-modal>
  `,
  styles: [`
    .premium-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--josanz-text-muted);
      margin-bottom: 4px;
    }
    .premium-desc {
      font-size: 13px;
      color: var(--josanz-text-muted);
      opacity: 0.7;
    }
    .shape-selector {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 2px solid var(--josanz-border);
      background: var(--josanz-bg);
      transition: all 0.2s;
      cursor: pointer;
      text-align: left;
      font-weight: 600;
      color: var(--josanz-text);
    }
    .shape-selector--rounded {
      border-radius: 12px;
    }
    .shape-selector--pill {
      border-radius: 9999px;
    }
    .shape-selector--sharp {
      border-radius: 2px;
    }
    .shape-selector:hover {
      border-color: var(--josanz-primary);
      transform: translateX(4px);
    }
    .shape-selector.active {
      border-color: var(--josanz-primary);
      background: color-mix(in srgb, var(--josanz-primary) 10%, transparent);
    }
    .atmosphere-card {
      height: 140px;
      padding: 20px;
      border-radius: 20px;
      border: 2px solid var(--josanz-border);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      color: var(--josanz-text);
    }
    .atmosphere-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      border-color: var(--josanz-accent);
    }
    .atmosphere-card.active {
      border-color: var(--josanz-accent);
      box-shadow: 0 0 0 2px var(--josanz-accent);
    }
    .atmosphere-preview {
      width: 100%;
      height: 60px;
      background: rgba(0,0,0,0.1);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .preview-line {
      height: 4px;
      border-radius: 2px;
      background: currentColor;
      opacity: 0.2;
    }
    .preview-dot {
      width: 12px;
      height: 12px;
      border-radius: 4px;
      margin-top: auto;
    }
    .glow-accent {
      box-shadow: 0 0 10px var(--josanz-accent);
    }
  `]
})
export class ThemeModalComponent {
  public themeService = inject(JosanzThemeService);
  @Output() modalClose = new EventEmitter<void>();

  brandingColors = ['#635BFF', '#22C55E', '#F59E0B', '#EF4444', '#EC4899', '#222222', '#38BDF8', '#8B5CF6'];

  allAtmospheres: { name: JosanzAtmosphereName; label: string }[] = [
    { name: 'neutral', label: 'Neutral White' },
    { name: 'ubisoft', label: 'Ubisoft Blue' },
    { name: 'nintendo', label: 'Nintendo Red' },
    { name: 'rayman', label: 'Rayman Magic' },
    { name: 'rockstar', label: 'Rockstar Gold' },
    { name: 'easports', label: 'EA Sports Grid' },
    { name: 'cyberpunk', label: 'Cyber Neon' },
    { name: 'midnight', label: 'Midnight Deep' },
    { name: 'ocean', label: 'Ocean Pacific' },
    { name: 'forest', label: 'Forest Green' },
    { name: 'sunset', label: 'Sunset Orange' },
    { name: 'industrial', label: 'Industrial Steel' },
  ];
}
