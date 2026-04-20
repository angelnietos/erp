import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Capa de HTML inyectado (p. ej. mensajes dinámicos desde Buddy).
 * Por defecto no tapa el formulario de login: z-index bajo respecto a `.auth-card`.
 */
@Component({
  selector: 'ui-dynamic-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dynamic-canvas-container" [innerHTML]="safeHtml"></div>
  `,
  styles: [
    `
      .dynamic-canvas-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 5;
        overflow: hidden;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicCanvasComponent implements OnChanges, OnDestroy {
  @Input() htmlRef = '';

  /**
   * Tras mostrar contenido, opcionalmente vacía el canvas pasados N ms.
   * `null` (por defecto): no se borra solo; el caller limpia vía store o vaciando `htmlRef`.
   */
  @Input() autoClearAfterMs: number | null = null;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  safeHtml: SafeHtml = '';
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['htmlRef']) {
      return;
    }

    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.htmlRef || '');

    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    const ms = this.autoClearAfterMs;
    if (this.htmlRef && ms != null && ms > 0) {
      this.timeoutId = setTimeout(() => {
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml('');
        this.timeoutId = undefined;
        this.cdr.markForCheck();
      }, ms);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
    }
  }
}
