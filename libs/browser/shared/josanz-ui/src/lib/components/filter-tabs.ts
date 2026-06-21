import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
/** `figma`: chips DDECFF. `segmented`: control segmentado Eventos (Figma 388:16932). `underline`: subrayado. `brand`: color de marca. */
export type JosanzFilterTabsVariant = 'figma' | 'segmented' | 'underline' | 'brand';

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

  @Input() shape?: JosanzControlShape;

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

  useUnderlineTabs(): boolean {
    return this.variant === 'underline';
  }

  useSegmentedTabs(): boolean {
    return this.variant === 'segmented';
  }

  private useFigmaChips(): boolean {
    if (this.variant === 'underline' || this.variant === 'segmented') {
      return false;
    }
    if (this.variant === 'figma') {
      return true;
    }
    if (this.variant === 'brand') {
      return false;
    }
    return this.themeService.currentTheme().atmosphere.name === 'neutral';
  }

  containerClass(): string {
    if (this.useSegmentedTabs()) {
      return 'josanz-filter-tabs--segmented inline-flex min-w-0 max-w-full items-center gap-0 overflow-x-auto no-scrollbar';
    }
    if (this.useUnderlineTabs()) {
      return 'flex min-w-0 items-end gap-8 overflow-x-auto no-scrollbar w-full border-b border-solid border-[var(--josanz-border)]';
    }
    return 'flex min-w-0 items-center gap-3 overflow-x-auto no-scrollbar pb-1 -mb-1 w-full';
  }

  buttonClass(option: string): string {
    if (this.useSegmentedTabs()) {
      const active = this.active === option;
      return [
        'josanz-filter-tabs__segment',
        active ? 'josanz-filter-tabs__segment--active' : 'josanz-filter-tabs__segment--idle',
      ].join(' ');
    }
    if (this.useUnderlineTabs()) {
      const active = this.active === option;
      return [
        'relative px-0 pb-3 pt-1 text-[14px] font-semibold bg-transparent border-0 cursor-pointer outline-none whitespace-nowrap transition-colors',
        active
          ? 'text-[var(--josanz-text)]'
          : 'text-[var(--josanz-text-muted)] hover:text-[var(--josanz-text)]',
      ].join(' ');
    }
    const figma = this.useFigmaChips();
    const shapeClass = figma
      ? 'rounded-lg'
      : ({
          rounded: 'rounded-xl',
          pill: 'rounded-full',
          square: 'rounded-none',
        }[this.shape ?? this.themeService.currentTheme().defaultShape] ??
        'rounded-lg');

    const base = `px-5 h-[34px] ${shapeClass} flex items-center justify-center text-[12px] font-bold transition-all duration-200 cursor-pointer outline-none whitespace-nowrap border border-solid`;
    if (this.active === option) {
      return figma
        ? `${base} border-transparent`
        : `${base} border-none scale-[1.02]`;
    }
    return `${base} hover:brightness-[0.99] active:scale-[0.98]`;
  }

  showUnderline(option: string): boolean {
    return this.useUnderlineTabs() && this.active === option;
  }

  pillStyles(option: string): Record<string, string> {
    if (this.useSegmentedTabs() || this.useUnderlineTabs()) {
      return {};
    }
    if (this.active === option) {
      if (this.useFigmaChips()) {
        const activeText = 'var(--josanz-pill-active-text, #080808)';
        return {
          color: activeText,
          WebkitTextFillColor: activeText,
          backgroundColor: 'var(--josanz-pill-active-bg, #ddecff)',
          borderColor: 'var(--josanz-pill-active-border, rgba(8, 8, 8, 0.2))',
          boxShadow: '0 2px 10px -2px var(--josanz-focus-ring)',
        };
      }
      const on = 'var(--josanz-button-primary-text, var(--josanz-on-primary))';
      return {
        color: on,
        WebkitTextFillColor: on,
        backgroundColor:
          this.customColor ??
          'var(--josanz-button-primary-bg, var(--josanz-primary))',
        borderColor: 'transparent',
        boxShadow:
          'var(--josanz-button-shadow, 0 4px 14px -2px color-mix(in srgb, var(--josanz-primary) 45%, transparent))',
      };
    }
    return {
      color: 'var(--josanz-button-secondary-text, var(--josanz-text-muted))',
      WebkitTextFillColor: 'var(--josanz-button-secondary-text, var(--josanz-text-muted))',
      backgroundColor:
        'var(--josanz-button-secondary-bg, var(--josanz-surface))',
      borderColor:
        'var(--josanz-button-secondary-border, var(--josanz-border))',
    };
  }
}
