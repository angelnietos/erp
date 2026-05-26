import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-[rgba(0,0,0,0.85)] p-0 md:p-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title || 'Modal'"
      (click)="onBackdropClick($event)"
    >
      <div
        #panel
        tabindex="-1"
        [class]="modalClasses + ' max-md:h-[95vh] max-md:rounded-t-[32px] max-md:rounded-b-none'"
        [style.backgroundColor]="themeService.currentTheme().atmosphere.surface"
        [style.width]="width"
        [style.maxWidth]="'100%'"
        [style.maxHeight]="'95vh'"
        (click)="$event.stopPropagation()"
      >
        <div class="md:hidden w-full flex justify-center pt-3 pb-1">
          <div class="w-12 h-1.5 rounded-full bg-[var(--josanz-border)] opacity-40"></div>
        </div>

        <button
          type="button"
          (click)="onClose($event)"
          class="absolute top-4 right-4 md:top-8 md:right-8 p-1.5 rounded-full transition-all z-[60] opacity-50 hover:opacity-100 cursor-pointer hover:bg-[color-mix(in_srgb,var(--josanz-border)_45%,transparent)]"
          [style.color]="'var(--josanz-text)'"
          aria-label="Cerrar modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="flex-1 overflow-y-auto px-6 md:px-12 pt-12 md:pt-14 pb-8 no-scrollbar">
          <h2
            class="text-[24px] md:text-[32px] font-bold mb-8 md:mb-10 pr-12 tracking-tight"
            [style.color]="customColor || 'var(--josanz-text)'"
          >
            {{ title }}
          </h2>
          <div [style.color]="'var(--josanz-text)'">
            <ng-content></ng-content>
          </div>
        </div>

        <div
          class="px-6 md:px-12 py-6 md:py-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 flex-shrink-0 border-t"
          [style.backgroundColor]="'var(--josanz-surface)'"
          [style.borderColor]="'var(--josanz-border)'"
        >
          <ng-content select="[footer-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class ModalComponent implements AfterViewInit {
  public themeService = inject(JosanzThemeService);

  @ViewChild('panel') panelRef?: ElementRef<HTMLElement>;

  @Input() title = '';
  @Input() width = '712px';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() trapFocus = true;
  @Input() closeOnBackdrop = true;

  @Output() close = new EventEmitter<void>();

  ngAfterViewInit(): void {
    queueMicrotask(() => this.focusFirst());
  }

  get modalClasses() {
    const base =
      'shadow-[0px_20px_50px_rgba(0,0,0,0.2)] flex flex-col relative overflow-hidden transition-all duration-300 outline-none';

    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;
    const shapes = {
      rounded: 'rounded-[24px]',
      pill: 'rounded-[40px]',
      square: 'rounded-none',
      modal: 'rounded-[24px]',
      inner: 'rounded-[12px]',
      avatar: 'rounded-[12px]',
      field: 'rounded-[12px]',
    };

    return [base, shapes[activeShape as keyof typeof shapes] || shapes.rounded].join(' ');
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onClose();
      return;
    }
    if (this.trapFocus && event.key === 'Tab') {
      this.handleTab(event);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.close.emit();
  }

  private focusableElements(): HTMLElement[] {
    const root = this.panelRef?.nativeElement;
    if (!root) {
      return [];
    }
    return Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  private focusFirst(): void {
    const items = this.focusableElements();
    (items[0] ?? this.panelRef?.nativeElement)?.focus();
  }

  private handleTab(event: KeyboardEvent): void {
    const items = this.focusableElements();
    if (!items.length) {
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
