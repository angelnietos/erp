import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JOSANZ_FIGMA_SHELL } from '../theme/josanz-figma-tokens';

/** `figma`: chips del export (DDECFF activo). `brand`: tinte con color de marca. */
export type JosanzFilterTabsVariant = 'figma' | 'brand';

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

  /** Por defecto chips Figma (neutro y listados de producto). */
  @Input() variant: JosanzFilterTabsVariant = 'figma';

  @Input() shape: JosanzControlShape = 'rounded';

  @Input() customColor?: string;

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

  private useFigmaChips(): boolean {
    if (this.variant === 'figma') {
      return true;
    }
    if (this.variant === 'brand') {
      return false;
    }
    return this.themeService.currentTheme().atmosphere.name === 'neutral';
  }

  buttonClass(option: string): string {
    const figma = this.useFigmaChips();
    const shapeClass = figma
      ? 'rounded-lg'
      : {
          rounded: 'rounded-xl',
          pill: 'rounded-full',
          square: 'rounded-none',
        }[this.shape ?? this.themeService.currentTheme().defaultShape] ?? 'rounded-lg';

    const base = `px-5 h-[34px] ${shapeClass} flex items-center justify-center text-[12px] font-bold transition-all duration-200 cursor-pointer outline-none whitespace-nowrap border border-solid`;
    if (this.active === option) {
      return figma ? `${base} border-transparent` : `${base} border-none scale-[1.02]`;
    }
    return `${base} hover:brightness-[0.99] active:scale-[0.98]`;
  }

  pillStyles(option: string): Record<string, string> {
    if (this.active === option) {
      if (this.useFigmaChips()) {
        return {
          color: JOSANZ_FIGMA_SHELL.pillActiveText,
          WebkitTextFillColor: JOSANZ_FIGMA_SHELL.pillActiveText,
          backgroundColor: JOSANZ_FIGMA_SHELL.pillActiveBg,
          borderColor: JOSANZ_FIGMA_SHELL.pillActiveBg,
        };
      }
      const on = 'var(--josanz-on-primary)';
      return {
        color: on,
        WebkitTextFillColor: on,
        backgroundColor: this.customColor ?? 'var(--josanz-primary)',
        borderColor: 'transparent',
        boxShadow: '0 4px 14px -2px color-mix(in srgb, var(--josanz-primary) 45%, transparent)',
      };
    }
    return {
      color: 'var(--josanz-text-muted)',
      backgroundColor: 'var(--josanz-surface)',
      borderColor: 'var(--josanz-border)',
    };
  }
}
