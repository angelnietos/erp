import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        [attr.aria-describedby]="messageId"
        (click)="onBackdropClick($event)"
      >
        <section
          class="w-full max-w-md border border-solid p-6 shadow-2xl"
          [ngClass]="panelClass()"
          [ngStyle]="panelStyles()"
          (click)="$event.stopPropagation()"
        >
          <h2
            [id]="titleId"
            class="m-0 text-xl font-black"
            [style.color]="'var(--josanz-text)'"
          >
            {{ title }}
          </h2>
          <p
            [id]="messageId"
            class="m-0 mt-3 text-sm leading-relaxed"
            [style.color]="'var(--josanz-text-muted)'"
          >
            {{ message }}
          </p>
          <div class="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              class="rounded-full border border-solid bg-transparent px-4 py-2 text-sm font-black"
              [style.borderColor]="'var(--josanz-border)'"
              [style.color]="'var(--josanz-text)'"
              (click)="cancel()"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="rounded-full border-0 px-4 py-2 text-sm font-black text-white"
              [style.backgroundColor]="confirmColor"
              (click)="confirm()"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly themeService = inject(JosanzThemeService);

  readonly titleId = `josanz-confirm-title-${Math.random().toString(36).slice(2, 9)}`;
  readonly messageId = `josanz-confirm-msg-${Math.random().toString(36).slice(2, 9)}`;

  @Input() open = false;
  @Input() title = '¿Confirmar acción?';
  @Input() message = 'Esta acción no se puede deshacer.';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() confirmColor = 'var(--josanz-danger)';
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() shape?: JosanzControlShape;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (this.open && this.closeOnEscape && event.key === 'Escape') {
      this.cancel();
    }
  }

  confirm(): void {
    this.confirmed.emit();
    this.setOpen(false);
  }

  cancel(): void {
    this.cancelled.emit();
    this.setOpen(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.cancel();
    }
  }

  panelClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[40px]';
    }
    return 'rounded-3xl';
  }

  panelStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
    };
  }

  private setOpen(value: boolean): void {
    this.open = value;
    this.openChange.emit(value);
  }
}
