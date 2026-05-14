import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzCornerInner, type JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';
import { josanzReadableOnSolid } from '../theme/josanz-theme-tokens';

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
  /** Esquinas de botones (misma semántica que `josanz-button`). */
  @Input() shape: JosanzControlShape = 'rounded';
  /** Color de la página activa (y borde); por defecto usa `--josanz-primary`. */
  @Input() customColor?: string;

  @Output() pageChange = new EventEmitter<number>();

  readonly cornerClass = (): string => josanzCornerInner(this.shape);

  /** Página acotada a [1, total] cuando hay páginas. */
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
      return {
        backgroundColor: accent,
        borderColor: accent,
        color: josanzReadableOnSolid(accent),
      };
    }
    return {
      backgroundColor: a.surface,
      borderColor: a.border,
      color: a.text,
    };
  }
}
