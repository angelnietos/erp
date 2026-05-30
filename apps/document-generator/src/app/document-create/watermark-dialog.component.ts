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
  template: ``,
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
}