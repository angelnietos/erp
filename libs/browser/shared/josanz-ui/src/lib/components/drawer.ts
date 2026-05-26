import { CommonModule } from '@angular/common';
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
import {
  josanzFocusFirst,
  josanzHandleTabTrap,
} from '../a11y/josanz-focus-trap';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50" role="presentation">
        @if (showBackdrop) {
          <button
            class="absolute inset-0 border-0 bg-black/40 p-0"
            type="button"
            aria-label="Cerrar panel"
            (click)="close()"
          ></button>
        }
        <aside
          #panel
          tabindex="-1"
          class="absolute flex max-w-full flex-col border border-solid p-0 shadow-2xl outline-none"
          [ngClass]="drawerClasses()"
          [ngStyle]="drawerStyles()"
          role="dialog"
          [attr.aria-modal]="showBackdrop"
          [attr.aria-label]="ariaLabel || title"
        >
          <header
            class="flex items-start justify-between gap-4 border-b border-solid p-5"
            [style.borderColor]="'var(--josanz-border)'"
          >
            <div class="min-w-0">
              @if (eyebrow) {
                <p
                  class="m-0 text-[10px] font-black uppercase tracking-[0.18em]"
                  [style.color]="'var(--josanz-text-muted)'"
                >
                  {{ eyebrow }}
                </p>
              }
              <h2
                class="m-0 text-xl font-black"
                [style.color]="'var(--josanz-text)'"
              >
                {{ title }}
              </h2>
              @if (description) {
                <p
                  class="m-0 mt-1 text-sm"
                  [style.color]="'var(--josanz-text-muted)'"
                >
                  {{ description }}
                </p>
              }
            </div>
            @if (closable) {
              <button
                class="rounded-full border-0 bg-transparent p-1 text-xl leading-none"
                type="button"
                aria-label="Cerrar panel"
                [style.color]="'var(--josanz-text-muted)'"
                (click)="close()"
              >
                ×
              </button>
            }
          </header>
          <div class="min-h-0 flex-1 overflow-auto p-5">
            <ng-content></ng-content>
          </div>
        </aside>
      </div>
    }
  `,
})
export class DrawerComponent implements AfterViewInit {
  readonly themeService = inject(JosanzThemeService);

  @ViewChild('panel') panelRef?: ElementRef<HTMLElement>;

  @Input() open = false;
  @Input() title = 'Panel';
  @Input() eyebrow = '';
  @Input() description = '';
  @Input() position: 'left' | 'right' | 'bottom' = 'right';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() closable = true;
  @Input() showBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() trapFocus = true;
  @Input() shape?: JosanzControlShape;
  @Input() ariaLabel = '';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  ngAfterViewInit(): void {
    if (this.open && this.trapFocus) {
      queueMicrotask(() => josanzFocusFirst(this.panelRef?.nativeElement));
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.open) {
      return;
    }
    if (this.closeOnEscape && event.key === 'Escape') {
      this.close();
      return;
    }
    if (this.trapFocus && event.key === 'Tab') {
      josanzHandleTabTrap(event, this.panelRef?.nativeElement);
    }
  }

  close(): void {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit();
  }

  drawerClasses(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    const radius =
      shape === 'square'
        ? 'rounded-none'
        : this.position === 'bottom'
          ? 'rounded-t-3xl'
          : 'rounded-3xl';
    const sizeClass =
      this.size === 'sm'
        ? 'w-[360px]'
        : this.size === 'lg'
          ? 'w-[720px]'
          : 'w-[480px]';
    if (this.position === 'left') {
      return `inset-y-4 left-4 ${sizeClass} ${radius}`;
    }
    if (this.position === 'bottom') {
      return `inset-x-4 bottom-4 max-h-[82vh] ${radius}`;
    }
    return `inset-y-4 right-4 ${sizeClass} ${radius}`;
  }

  drawerStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
    };
  }
}
