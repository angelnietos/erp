import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { type JosanzControlShape } from '../josanz-control-styles';
export type JosanzMainTabsVariant = 'figma' | 'brand';

@Component({
  selector: 'josanz-main-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex gap-2 w-full overflow-x-auto no-scrollbar pb-1"
      [class.mb-6]="!dense"
    >
      @for (option of options; track option) {
        <button
          type="button"
          (click)="select(option)"
          [class]="tabClasses(option)"
          [ngStyle]="tabShellStyle(option)"
        >
          @if (tabAlerts[option]) {
          <span
            class="josanz-main-tab__alert"
            [attr.title]="tabAlertHint(option)"
            role="img"
            [attr.aria-label]="tabAlertHint(option)"
          >!</span>
          }
          {{ option }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .josanz-main-tab__alert {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: #ef4444;
        color: #fff;
        font-size: 9px;
        font-weight: 800;
        line-height: 1;
        flex-shrink: 0;
        cursor: help;
      }
    `,
  ],
})
export class MainTabsComponent implements OnInit, OnChanges {
  public themeService = inject(JosanzThemeService);

  @Input() options: string[] = [];
  @Input() selection = '';
  @Output() selectionChange = new EventEmitter<string>();
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() variant: JosanzMainTabsVariant = 'figma';
  /** Sin margen inferior (p. ej. cabecera detalle Figma). */
  @Input() dense = false;
  /** Icono de alerta rojo en pestañas con datos pendientes. */
  @Input() tabAlerts: Record<string, boolean> = {};
  /** Motivo del icono de alerta (tooltip). */
  @Input() tabAlertHints: Record<string, string> = {};

  active = '';

  private useFigmaTabs(): boolean {
    return this.variant === 'figma';
  }

  tabShellStyle(option: string): Record<string, string> {
    const on = this.active === option;
    const accent = this.customColor ?? 'var(--josanz-interactive)';
    const accentText = this.customColor ?? 'var(--josanz-pill-active-text)';
    if (this.variant === 'figma') {
      const isNeutral =
        this.themeService.currentTheme().atmosphere.name === 'neutral';
      if (isNeutral) {
        const color = on ? '#222222' : '#a1a1a1';
        return {
          backgroundColor: 'var(--josanz-surface)',
          borderColor: on ? '#222222' : '#e7edf1',
          color,
          WebkitTextFillColor: color,
          boxShadow: '0 4px 4px rgba(178, 178, 178, 0.3)',
        };
      }
      const color = on
        ? 'var(--josanz-segmented-active-text, var(--josanz-interactive))'
        : 'var(--josanz-segmented-idle-text, var(--josanz-list-card-text-muted))';
      return {
        backgroundColor: on
          ? 'var(--josanz-brand-soft-strong, var(--josanz-pill-active-bg))'
          : 'transparent',
        borderColor: on
          ? accent
          : 'var(--josanz-brand-border, var(--josanz-list-card-border))',
        color,
        WebkitTextFillColor: color,
        boxShadow: on
          ? 'var(--josanz-list-card-shadow, 0 2px 8px rgba(0, 0, 0, 0.08))'
          : 'none',
      };
    }
    const color = on ? accentText : 'var(--josanz-text-muted)';
    return {
      backgroundColor: on ? 'var(--josanz-pill-active-bg)' : 'var(--josanz-surface)',
      borderColor: on ? accent : 'var(--josanz-border)',
      color,
      WebkitTextFillColor: color,
    };
  }

  tabClasses(option: string) {
    const figma = this.useFigmaTabs();
    const base = figma
      ? 'inline-flex items-center gap-1.5 h-[25px] px-[10px] text-[12px] font-semibold transition-[color,border-color] whitespace-nowrap border border-solid rounded-[6px]'
      : 'px-5 py-2.5 text-[12px] font-bold transition-[box-shadow,filter,color,border-color] whitespace-nowrap border border-solid';

    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;
    const shapes = figma
      ? { rounded: '', pill: '', square: '', inner: '' }
      : {
          rounded: 'rounded-[10px]',
          pill: 'rounded-full',
          square: 'rounded-none',
          inner: 'rounded-[8px]',
        };

    return [
      base,
      shapes[activeShape as keyof typeof shapes] || shapes.rounded,
      this.active === option ? '' : 'hover:bg-[var(--josanz-surface-muted)]',
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

  tabAlertHint(option: string): string {
    return (
      this.tabAlertHints[option]?.trim() ||
      'Información pendiente en esta pestaña'
    );
  }
}
