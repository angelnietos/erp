import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { type JosanzControlShape } from '../josanz-control-styles';
import { JOSANZ_FIGMA_SHELL } from '../theme/josanz-figma-tokens';

export type JosanzMainTabsVariant = 'figma' | 'brand';

@Component({
  selector: 'josanz-main-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-3 w-full overflow-x-auto no-scrollbar pb-1 mb-6">
      @for (option of options; track option) {
        <button
          type="button"
          (click)="select(option)"
          [class]="tabClasses(option)"
          [ngStyle]="tabShellStyle(option)"
        >
          {{ option }}
        </button>
      }
    </div>
  `,
})
export class MainTabsComponent implements OnInit, OnChanges {
  public themeService = inject(JosanzThemeService);

  @Input() options: string[] = [];
  @Input() selection = '';
  @Output() selectionChange = new EventEmitter<string>();
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() variant: JosanzMainTabsVariant = 'figma';

  active = '';

  private useFigmaTabs(): boolean {
    return (
      this.variant === 'figma' ||
      this.themeService.currentTheme().atmosphere.name === 'neutral'
    );
  }

  tabShellStyle(option: string): Record<string, string> {
    const on = this.active === option;
    if (this.useFigmaTabs()) {
      return {
        backgroundColor: 'var(--josanz-surface)',
        borderColor: on ? JOSANZ_FIGMA_SHELL.pillActiveText : 'var(--josanz-border)',
        color: on ? JOSANZ_FIGMA_SHELL.pillActiveText : 'var(--josanz-text-muted)',
      };
    }
    return {
      backgroundColor: 'var(--josanz-surface)',
      borderColor: on ? 'var(--josanz-accent)' : 'var(--josanz-border)',
      color: on ? 'var(--josanz-accent)' : 'var(--josanz-text-muted)',
    };
  }

  tabClasses(option: string) {
    const base =
      'px-5 py-2.5 text-[12px] font-bold transition-[box-shadow,filter,color,border-color] whitespace-nowrap border border-solid';

    const figma = this.useFigmaTabs();
    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;
    const shapes = figma
      ? { rounded: 'rounded-lg', pill: 'rounded-full', square: 'rounded-none', inner: 'rounded-lg' }
      : {
          rounded: 'rounded-[10px]',
          pill: 'rounded-full',
          square: 'rounded-none',
          inner: 'rounded-[8px]',
        };

    return [
      base,
      shapes[activeShape as keyof typeof shapes] || shapes.rounded,
      this.active === option ? 'shadow-sm' : 'hover:brightness-[0.99]',
    ].join(' ');
  }

  ngOnInit(): void {
    this.syncFromInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selection'] || changes['options']) {
      this.syncFromInputs();
    }
  }

  private syncFromInputs(): void {
    const opts = this.options ?? [];
    const sel = (this.selection ?? '').trim();
    if (sel && opts.includes(sel)) {
      this.active = sel;
    } else if (opts.length) {
      this.active = opts[0];
    } else {
      this.active = '';
    }
  }

  select(option: string): void {
    if (this.active === option) {
      return;
    }
    this.active = option;
    this.selectionChange.emit(option);
  }
}
