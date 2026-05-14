import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JOSANZ_FIGMA_SHELL } from '../theme/josanz-figma-tokens';

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
    const base = `px-6 h-[32px] rounded-full flex items-center justify-center text-[13px] font-bold transition-all cursor-pointer outline-none whitespace-nowrap shadow-sm`;
    if (this.active === option) {
      return `${base} border-none`;
    }
    return `${base} border border-solid hover:brightness-[0.99]`;
  }

  pillStyles(option: string): Record<string, string> {
    const theme = this.themeService.currentTheme();
    if (this.active === option) {
      return {
        color: 'white',
        backgroundColor: 'var(--josanz-primary)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      };
    }
    return {
      color: 'var(--josanz-text-muted)',
      backgroundColor: 'var(--josanz-surface)',
      borderColor: 'var(--josanz-border)',
    };
  }
}
