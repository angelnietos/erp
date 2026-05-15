import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzCornerButton, type JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';
import { josanzReadableOnSolid } from '../theme/josanz-theme-tokens';
import { JOSANZ_FIGMA_SHELL } from '../theme/josanz-figma-tokens';

@Component({
  selector: 'josanz-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  readonly themeService = inject(JosanzThemeService);

  /** Página actual (1-based). */
  @Input() current = 1;
  /** Total de páginas (≥ 0). Si es 0 no se muestra barra. */
  @Input() total = 1;
  /** Override del shape; si no se pasa, usa el shape del tema activo. */
  @Input() shape?: JosanzControlShape;
  /** Color de la página activa (y borde); por defecto usa `--josanz-primary`. */
  @Input() customColor?: string;

  /** `figma`: bloque compacto estilo lienzo; `numbered`: páginas 1–N + «…». */
  @Input() variant: 'figma' | 'numbered' = 'figma';

  @Output() pageChange = new EventEmitter<number>();

  readonly cornerClass = (): string =>
    josanzCornerButton(this.shape ?? this.themeService.currentTheme().defaultShape);

  shellBlockClass(): string {
    return `${this.cornerClass()} overflow-hidden inline-flex flex-row items-stretch border border-solid`;
  }

  shellBlockCombinedStyle(): Record<string, string> {
    const base = this.surfaceNavStyle();
    return {
      ...base,
      boxShadow: 'var(--josanz-elev-soft)',
    };
  }

  get effectiveCurrent(): number {
    if (this.total < 1) {
      return 1;
    }
    return Math.min(this.total, Math.max(1, this.current));
  }

  /**
   * Números visibles con elipsis (estilo clásico: inicio, ventana alrededor de current, fin).
   */
  pageItems(): Array<number | 'ellipsis'> {
    const total = this.total;
    const current = this.effectiveCurrent;
    if (total <= 0) {
      return [];
    }
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const delta = 1;
    const range: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    const out: Array<number | 'ellipsis'> = [];
    let last = 0;
    for (const i of range) {
      if (last && i - last > 1) {
        out.push('ellipsis');
      }
      out.push(i);
      last = i;
    }
    return out;
  }

  go(page: number): void {
    if (page < 1 || page > this.total || page === this.effectiveCurrent) {
      return;
    }
    this.pageChange.emit(page);
  }

  prev(): void {
    this.go(this.effectiveCurrent - 1);
  }

  next(): void {
    this.go(this.effectiveCurrent + 1);
  }

  trackPageItem(index: number, item: number | 'ellipsis'): string {
    return item === 'ellipsis' ? `e-${index}` : String(item);
  }

  surfaceNavStyle(): Record<string, string> {
    const a = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: a.surface,
      borderColor: a.border,
      color: a.text,
    };
  }

  pageButtonStyle(active: boolean): Record<string, string> {
    const a = this.themeService.currentTheme().atmosphere;
    const accent = this.customColor ?? this.themeService.currentTheme().primaryColor;
    if (active) {
      if (this.customColor) {
        return {
          backgroundColor: accent,
          borderColor: accent,
          color: josanzReadableOnSolid(accent),
        };
      }
      return {
        backgroundColor: JOSANZ_FIGMA_SHELL.pillActiveBg,
        borderColor: JOSANZ_FIGMA_SHELL.hairlineBorder,
        color: JOSANZ_FIGMA_SHELL.pillActiveText,
      };
    }
    return {
      backgroundColor: a.surface,
      borderColor: a.border,
      color: a.text,
    };
  }
}
