import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';

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
    const activeShape = this.themeService.currentTheme().defaultShape;
    const shapeClass = {
      rounded: 'rounded-xl',
      pill: 'rounded-full',
      square: 'rounded-none',
    }[activeShape] ?? 'rounded-xl';

    const base = `px-5 h-[34px] ${shapeClass} flex items-center justify-center text-[12px] font-bold transition-all duration-200 cursor-pointer outline-none whitespace-nowrap`;
    if (this.active === option) {
      return `${base} border-none scale-[1.02]`;
    }
    return `${base} border border-solid hover:scale-[1.02] active:scale-95`;
  }

  pillStyles(option: string): Record<string, string> {
    if (this.active === option) {
      return {
        color: 'white',
        backgroundColor: 'var(--josanz-primary)',
        boxShadow: '0 4px 16px -2px color-mix(in srgb, var(--josanz-primary) 60%, transparent)'
      };
    }
    return {
      color: 'var(--josanz-text-muted)',
      backgroundColor: 'var(--josanz-surface)',
      borderColor: 'var(--josanz-border)',
    };
  }
}
