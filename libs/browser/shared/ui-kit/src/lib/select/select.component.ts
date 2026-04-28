import {
  Component, Input, Output, EventEmitter, forwardRef,
  HostListener, ElementRef, inject, ViewChild, OnDestroy, NgZone,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type SelectVariant =
  | 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light'
  | 'error' | 'success' | 'warning' | 'info' | 'theme' | 'primary'
  | 'secondary' | 'transparent' | 'minimal' | 'rounded' | 'glass' | 'soft';

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UiSelectComponent),
    multi: true,
  }],
  template: `
    <div class="form-group" [class.disabled]="disabled">
      @if (label) { <label [for]="id">{{ label }}</label> }
      <div
        #triggerRef
        class="select-wrapper"
        [class.is-open]="isOpen"
        [class.select-sm]="size === 'sm'"
        (click)="toggleDropdown()"
      >
        <div class="select-trigger" [class.invalid]="error">
          <span class="placeholder-text" [class.hidden]="!!selectedLabel">{{ placeholder }}</span>
          <span class="selected-text">{{ selectedLabel }}</span>
        </div>
        <div class="chevron"></div>
      </div>
    </div>
  `,
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    .form-group { display:flex; flex-direction:column; gap:0.5rem; width:100%; }
    label {
      font-size:0.7rem; font-weight:700; text-transform:uppercase;
      letter-spacing:0.1em; color:var(--text-muted);
      margin-left:0.25rem; font-family:var(--font-main);
    }
    .select-wrapper {
      position:relative; display:flex; align-items:stretch;
      border-radius:var(--radius-md,10px); cursor:pointer; user-select:none;
    }
    .select-trigger {
      width:100%; padding:0.75rem 3rem 0.75rem 1rem;
      background:var(--surface-vibrant,rgba(255,255,255,0.05));
      border:1px solid var(--border-soft,rgba(255,255,255,0.1));
      border-radius:var(--radius-md,10px); color:var(--text-primary);
      font-size:0.9rem; font-weight:500; line-height:1.5;
      transition:all 0.2s ease; font-family:var(--font-main);
      box-shadow:var(--shadow-sm); min-height:2.75rem;
      display:flex; align-items:center;
    }
    .placeholder-text { color:var(--text-muted); opacity:0.5; }
    .placeholder-text.hidden { display:none; }
    .select-wrapper:not(.disabled):hover .select-trigger {
      border-color:var(--brand);
      background:var(--surface-rich,rgba(255,255,255,0.08));
      transform:translateY(-1px);
    }
    .select-wrapper.select-sm .select-trigger {
      padding:0.45rem 2.5rem 0.45rem 0.85rem; font-size:0.8rem; min-height:auto;
    }
    .is-open .select-trigger {
      background:var(--surface-rich); border-color:var(--brand);
      box-shadow:0 0 0 3px var(--brand-glow),var(--shadow-md);
    }
    .select-trigger.invalid { border-color:var(--danger)!important; }
    .disabled { opacity:0.5; cursor:not-allowed; pointer-events:none; }
    .chevron {
      position:absolute; right:1rem; top:50%;
      width:0.4rem; height:0.4rem;
      border-right:2.5px solid var(--text-muted);
      border-bottom:2.5px solid var(--text-muted);
      transform:translateY(-60%) rotate(45deg);
      pointer-events:none; transition:transform 0.2s ease,border-color 0.2s ease;
      opacity:0.7;
    }
    .select-wrapper:hover .chevron { border-color:var(--brand); opacity:1; }
    .is-open .chevron { transform:translateY(-20%) rotate(225deg); border-color:var(--brand); opacity:1; }
    :host-context(html[data-erp-tenant='babooni']) .select-trigger {
      border-radius:12px; font-weight:600;
      border-color:color-mix(in srgb,var(--border-soft) 60%,transparent);
      box-shadow:var(--shadow-sm),inset 0 1px 0 var(--surface-glow,transparent);
      backdrop-filter:blur(10px);
    }
    :host-context(html[data-erp-tenant='babooni']) .select-wrapper:hover .select-trigger {
      box-shadow:var(--shadow-md),inset 0 1px 0 var(--surface-glow,transparent);
      border-color:var(--brand);
    }
    :host-context(html[data-erp-tenant='babooni']) label {
      font-size:0.72rem; font-weight:800; letter-spacing:0.05em; color:var(--brand);
    }
  `],
})
export class UiSelectComponent implements ControlValueAccessor, OnDestroy {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = 'Seleccionar...';
  @Input() options: { label: string; value: unknown }[] = [];
  @Input() error = false;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() variant: SelectVariant = 'default';

  @Output() change = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('triggerRef') triggerRef!: ElementRef<HTMLElement>;

  value: unknown = '';
  disabled = false;
  isOpen = false;

  private overlayEl: HTMLDivElement | null = null;
  private readonly elementRef = inject(ElementRef);
  private readonly zone = inject(NgZone);

  get selectedLabel(): string {
    return this.options.find(o => o.value === this.value)?.label ?? '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const inHost = this.elementRef.nativeElement.contains(event.target);
    const inOverlay = this.overlayEl?.contains(event.target as Node);
    if (!inHost && !inOverlay) this.closeDropdown();
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize')
  onViewChange(_e?: Event): void {
    if (this.isOpen) this.positionOverlay();
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }

  private openDropdown(): void {
    this.isOpen = true;
    this.buildOverlay();
  }

  private closeDropdown(): void {
    this.isOpen = false;
    this.destroyOverlay();
  }

  // ── Body-portal overlay ────────────────────────────────────────────────────

  private buildOverlay(): void {
    this.destroyOverlay();

    const el = document.createElement('div');
    el.className = 'ui-select-portal';

    // Get computed CSS variables from the host element for theming
    const hostStyle = getComputedStyle(document.documentElement);
    const brand     = hostStyle.getPropertyValue('--brand').trim()       || '#10b981';
    const surface   = hostStyle.getPropertyValue('--surface-rich').trim()|| '#111';
    const border    = hostStyle.getPropertyValue('--border-soft').trim() || 'rgba(255,255,255,0.1)';
    const textPrim  = hostStyle.getPropertyValue('--text-primary').trim()|| '#fff';
    const fontMain  = hostStyle.getPropertyValue('--font-main').trim()   || 'inherit';

    el.style.cssText = [
      'position:fixed',
      'overflow-y:auto',
      `background:${surface}`,
      'backdrop-filter:blur(20px)',
      '-webkit-backdrop-filter:blur(20px)',
      `border:1px solid ${border}`,
      'border-radius:12px',
      'z-index:2147483647',
      'box-shadow:0 20px 60px rgba(0,0,0,0.55),0 0 0 1px rgba(255,255,255,0.06)',
      'padding:6px',
      `font-family:${fontMain}`,
      'animation:uiSelectPopIn 0.18s cubic-bezier(0.16,1,0.3,1) both',
    ].join(';');

    // Inject keyframes once
    if (!document.getElementById('ui-select-keyframes')) {
      const s = document.createElement('style');
      s.id = 'ui-select-keyframes';
      s.textContent = `
        @keyframes uiSelectPopIn {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        .ui-select-portal::-webkit-scrollbar { width:4px; }
        .ui-select-portal::-webkit-scrollbar-thumb {
          background:rgba(255,255,255,0.2); border-radius:10px;
        }
      `;
      document.head.appendChild(s);
    }

    // Render options
    this.options.forEach(option => {
      const item = document.createElement('div');
      const isSelected = option.value === this.value;
      item.textContent = option.label;
      item.style.cssText = [
        'padding:0.7rem 1rem',
        'border-radius:8px',
        'font-size:0.85rem',
        'font-weight:' + (isSelected ? '700' : '500'),
        `color:${isSelected ? '#fff' : textPrim}`,
        `background:${isSelected ? brand : 'transparent'}`,
        'cursor:pointer',
        'margin-bottom:2px',
        'transition:background 0.12s,padding-left 0.12s',
        'user-select:none',
      ].join(';');

      item.addEventListener('mouseenter', () => {
        if (!isSelected) {
          item.style.background = `color-mix(in srgb,${brand} 18%,transparent)`;
          item.style.paddingLeft = '1.25rem';
        }
      });
      item.addEventListener('mouseleave', () => {
        if (!isSelected) {
          item.style.background = 'transparent';
          item.style.paddingLeft = '1rem';
        }
      });
      item.addEventListener('mousedown', (e) => {
        e.preventDefault(); // prevent blur before click
        e.stopPropagation();
        this.zone.run(() => this.selectValue(option));
      });

      el.appendChild(item);
    });

    this.overlayEl = el;
    document.body.appendChild(el);
    this.positionOverlay();
  }

  private positionOverlay(): void {
    const el = this.overlayEl;
    const trigger: HTMLElement =
      this.triggerRef?.nativeElement ??
      (this.elementRef.nativeElement as HTMLElement).querySelector('.select-wrapper');
    if (!el || !trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < 180 && rect.top > 200;
    const maxH = showAbove
      ? Math.min(250, rect.top - 12)
      : Math.min(250, spaceBelow - 12);

    el.style.left      = `${rect.left}px`;
    el.style.width     = `${rect.width}px`;
    el.style.maxHeight = `${maxH}px`;
    if (showAbove) {
      el.style.top    = 'auto';
      el.style.bottom = `${window.innerHeight - rect.top + 6}px`;
    } else {
      el.style.top    = `${rect.bottom + 6}px`;
      el.style.bottom = 'auto';
    }
  }

  private destroyOverlay(): void {
    this.overlayEl?.remove();
    this.overlayEl = null;
  }

  private selectValue(option: { label: string; value: unknown }): void {
    this.value = option.value;
    this.onChange(option.value);
    this.change.emit(String(option.value));
    this.valueChange.emit(String(option.value));
    this.closeDropdown();
    this.onTouched();
  }

  ngOnDestroy(): void { this.destroyOverlay(); }

  // ── ControlValueAccessor ───────────────────────────────────────────────────
  onChange: (v: unknown) => void = () => { /* stub */ };
  onTouched = () => { /* stub */ };

  writeValue(value: unknown): void { this.value = value; }
  registerOnChange(fn: (v: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
