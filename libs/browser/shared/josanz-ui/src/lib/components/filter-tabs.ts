import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { josanzCornerInner, type JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-filter-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-tabs.html',
  styleUrl: './filter-tabs.css',
})
export class FilterTabsComponent implements OnInit, OnChanges {
  private readonly themeService = inject(JosanzThemeService);

  @Input() options: string[] = ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'];
  @Input() selected = 'Todas';
  @Output() selectionChange = new EventEmitter<string>();

  /** Esquinas de cada pestaña (misma semántica que `josanz-button`). */
  @Input() shape: JosanzControlShape = 'rounded';
  /** Color de texto y tinte de fondo de la pestaña activa. */
  @Input() customColor?: string;

  /** Estado visual; se sincroniza con `selected` para no pisarse al pulsar. */
  active = 'Todas';

  ngOnInit(): void {
    this.syncFromInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected'] || changes['options']) {
      this.syncFromInputs();
    }
  }

  private syncFromInputs(): void {
    const opts = this.options ?? [];
    const sel = (this.selected ?? '').trim();
    if (sel && opts.includes(sel)) {
      this.active = sel;
    } else if (opts.length) {
      this.active = opts[0];
    } else {
      this.active = '';
    }
  }

  selectOption(option: string): void {
    if (this.active === option) {
      return;
    }
    this.active = option;
    this.selectionChange.emit(option);
  }

  buttonClass(option: string): string {
    const r = josanzCornerInner(this.shape);
    const base = `w-[120px] h-[25px] ${r} flex items-center justify-center text-[13px] font-medium transition-[box-shadow,transform,color,background-color] cursor-pointer outline-none`;
    if (this.active === option) {
      return `${base} border-none`;
    }
    return `${base} border border-solid hover:brightness-[0.99]`;
  }

  pillStyles(option: string): Record<string, string> {
    const theme = this.themeService.currentTheme();
    if (this.active === option) {
      if (this.customColor) {
        return {
          color: this.customColor,
          backgroundColor: `color-mix(in srgb, ${this.customColor} 16%, white)`,
        };
      }
      // Figma Base-1: pestaña activa #DDECFF, texto oscuro
      return {
        color: '#080808',
        backgroundColor: '#DDECFF',
      };
    }
    return {
      color: theme.atmosphere.textMuted,
      backgroundColor: theme.atmosphere.surface,
      borderColor: theme.atmosphere.border,
    };
  }
}
