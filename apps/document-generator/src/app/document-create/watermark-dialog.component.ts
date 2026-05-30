import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number;
  fontSize: number;
  color: string;
  rotation: number;
}

const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  enabled: false,
  text: '',
  opacity: 0.1,
  fontSize: 48,
  color: '#000000',
  rotation: -45,
};

@Component({
  selector: 'app-watermark-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <input type="checkbox" id="watermarkEnabled" [(ngModel)]="config.enabled" (ngModelChange)="onConfigChange()" class="w-4 h-4 rounded border-slate-300" />
        <label for="watermarkEnabled" class="text-sm font-medium text-slate-700">Activar marca de agua</label>
      </div>

      @if (config.enabled) {
        <div class="space-y-3">
          <div>
            <label for="watermarkText" class="block text-xs font-medium text-slate-600 mb-1">Texto de la marca</label>
            <input type="text" id="watermarkText" [(ngModel)]="config.text" (ngModelChange)="onConfigChange()" placeholder="Ej: CONFIDENCIAL" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="watermarkOpacity" class="block text-xs font-medium text-slate-600 mb-1">Opacidad (0-1)</label>
              <input type="number" id="watermarkOpacity" [(ngModel)]="config.opacity" (ngModelChange)="onConfigChange()" min="0" max="1" step="0.05" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              <label for="watermarkFontSize" class="block text-xs font-medium text-slate-600 mb-1">Tamaño fuente (px)</label>
              <input type="number" id="watermarkFontSize" [(ngModel)]="config.fontSize" (ngModelChange)="onConfigChange()" min="10" max="100" step="2" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="watermarkColor" class="block text-xs font-medium text-slate-600 mb-1">Color</label>
              <input type="color" id="watermarkColor" [(ngModel)]="config.color" (ngModelChange)="onConfigChange()" class="w-full h-10 border border-slate-300 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label for="watermarkRotation" class="block text-xs font-medium text-slate-600 mb-1">Rotación (deg)</label>
              <input type="number" id="watermarkRotation" [(ngModel)]="config.rotation" (ngModelChange)="onConfigChange()" min="-180" max="180" step="15" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class WatermarkDialogComponent {
  readonly initialConfig = input<Partial<WatermarkConfig>>({});
  readonly configChanged = output<WatermarkConfig>();

  config: WatermarkConfig = { ...DEFAULT_WATERMARK_CONFIG };

  ngOnInit() {
    this.setConfig(this.initialConfig());
  }

  ngOnChanges() {
    this.setConfig(this.initialConfig());
  }

  getConfig(): WatermarkConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<WatermarkConfig>): void {
    this.config = { ...this.config, ...config };
  }

  onConfigChange(): void {
    this.configChanged.emit({ ...this.config });
  }
}