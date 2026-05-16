import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzCornerButton, type JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService, type JosanzPaginationVariant } from '../services/theme.service';
import { josanzReadableOnSolid } from '../theme/josanz-theme-tokens';
import { JOSANZ_FIGMA_SHELL } from '../theme/josanz-figma-tokens';

export type { JosanzPaginationVariant } from '../services/theme.service';

@Component({
  selector: 'josanz-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  private static instanceSeq = 0;

  readonly themeService = inject(JosanzThemeService);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly pageListId = `josanz-pagination-pages-${++PaginationComponent.instanceSeq}`;

  /** Página actual (1-based). */
  @Input() current = 1;
  /** Total de páginas (≥ 0). Si es 0 no se muestra barra. */
  @Input() total = 1;
  /** Override del shape; si no se pasa, usa el shape del tema activo. */
  @Input() shape?: JosanzControlShape;
  /** Color de la página activa (y borde); por defecto usa `--josanz-primary`. */
  @Input() customColor?: string;

  /** `figma`: bloque compacto estilo lienzo; `numbered`: páginas 1–N + «…». */
  @Input() variant: JosanzPaginationVariant = 'figma';

  @Output() pageChange = new EventEmitter<number>();

  /** Desplegable del selector «actual / total» (variante figma). */
  pagePickerOpen = false;

  readonly cornerClass = (): string =>
    josanzCornerButton(this.shape ?? this.themeService.currentTheme().defaultShape);

  shellBlockClass(): string {
    const overflow = this.pagePickerOpen ? 'overflow-visible' : 'overflow-hidden';
    return `${this.cornerClass()} ${overflow} inline-flex flex-row items-stretch border border-solid`;
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
      this.closePagePicker();
      return;
    }
    this.pageChange.emit(page);
    this.closePagePicker();
  }

  pageOptions(): number[] {
    if (this.total < 1) {
      return [];
    }
    return Array.from({ length: this.total }, (_, i) => i + 1);
  }

  togglePagePicker(event: Event): void {
    event.stopPropagation();
    this.pagePickerOpen = !this.pagePickerOpen;
  }

  selectPage(page: number, event: Event): void {
    event.stopPropagation();
    this.go(page);
  }

  closePagePicker(): void {
    this.pagePickerOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.pagePickerOpen) {
      return;
    }
    const target = event.target as Node | null;
    if (target && this.host.nativeElement.contains(target)) {
      return;
    }
    this.closePagePicker();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePagePicker();
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
