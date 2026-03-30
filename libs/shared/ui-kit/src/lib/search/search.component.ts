import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type SearchVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'primary' | 'success' | 'warning' | 'error';

@Component({
  selector: 'ui-josanz-search',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="search-wrapper" [class]="'search-' + variant" [class.focused]="isFocused">
      <lucide-icon name="search" class="search-icon"></lucide-icon>
      <input 
        type="text" 
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (focus)="isFocused = true"
        (blur)="isFocused = false"
      />
      @if (value) {
        <button class="clear-btn" (click)="onClear()">
          <lucide-icon name="x"></lucide-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    .search-wrapper {
      position: relative; display: flex; align-items: center;
      border-radius: 12px; transition: all 0.2s;
    }

    /* Default Variant */
    .search-default {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .search-default.focused {
      border-color: #4F46E5;
      box-shadow: 0 0 0 4px rgba(79,70,229,0.15);
    }
    .search-default .search-icon { color: #64748B; }
    .search-default input { color: white; }
    .search-default input::placeholder { color: #64748B; }
    .search-default .clear-btn { color: #64748B; }
    .search-default .clear-btn:hover { color: white; }

    /* Filled Variant */
    .search-filled {
      background: var(--theme-background, #F8FAFC);
      border: 1px solid transparent;
    }
    .search-filled.focused {
      border-color: var(--theme-primary, #4F46E5);
      box-shadow: 0 0 0 4px rgba(79,70,229,0.15);
    }
    .search-filled .search-icon { color: var(--theme-text-muted, #64748B); }
    .search-filled input { color: var(--theme-text, #1E293B); }
    .search-filled input::placeholder { color: var(--theme-text-muted, #64748B); }
    .search-filled .clear-btn { color: var(--theme-text-muted, #64748B); }
    .search-filled .clear-btn:hover { color: var(--theme-text, #1E293B); }

    /* Outlined Variant */
    .search-outlined {
      background: transparent;
      border: 2px solid var(--theme-border, #E2E8F0);
    }
    .search-outlined.focused {
      border-color: var(--theme-primary, #4F46E5);
      box-shadow: 0 0 0 4px rgba(79,70,229,0.15);
    }
    .search-outlined .search-icon { color: var(--theme-text-muted, #64748B); }
    .search-outlined input { color: var(--theme-text, #1E293B); }
    .search-outlined input::placeholder { color: var(--theme-text-muted, #64748B); }
    .search-outlined .clear-btn { color: var(--theme-text-muted, #64748B); }
    .search-outlined .clear-btn:hover { color: var(--theme-text, #1E293B); }

    /* Ghost Variant */
    .search-ghost {
      background: transparent;
      border: 1px solid transparent;
    }
    .search-ghost.focused {
      background: var(--theme-surface, #FFFFFF);
      border-color: var(--theme-border, #E2E8F0);
    }
    .search-ghost .search-icon { color: var(--theme-text-muted, #64748B); }
    .search-ghost input { color: var(--theme-text, #1E293B); }
    .search-ghost input::placeholder { color: var(--theme-text-muted, #64748B); }
    .search-ghost .clear-btn { color: var(--theme-text-muted, #64748B); }
    .search-ghost .clear-btn:hover { color: var(--theme-text, #1E293B); }

    /* Dark Variant */
    .search-dark {
      background: #1E293B;
      border: 1px solid #334155;
    }
    .search-dark.focused {
      border-color: var(--theme-primary, #4F46E5);
      box-shadow: 0 0 0 4px rgba(79,70,229,0.15);
    }
    .search-dark .search-icon { color: #94A3B8; }
    .search-dark input { color: white; }
    .search-dark input::placeholder { color: #94A3B8; }
    .search-dark .clear-btn { color: #94A3B8; }
    .search-dark .clear-btn:hover { color: white; }

    /* Light Variant */
    .search-light {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
    }
    .search-light.focused {
      border-color: var(--theme-primary, #4F46E5);
      box-shadow: 0 0 0 4px rgba(79,70,229,0.15);
    }
    .search-light .search-icon { color: #64748B; }
    .search-light input { color: #1E293B; }
    .search-light input::placeholder { color: #64748B; }
    .search-light .clear-btn { color: #64748B; }
    .search-light .clear-btn:hover { color: #1E293B; }

    /* Primary Variant */
    .search-primary {
      background: rgba(79, 70, 229, 0.05);
      border: 1px solid rgba(79, 70, 229, 0.2);
    }
    .search-primary.focused {
      border-color: #4F46E5;
      box-shadow: 0 0 0 4px rgba(79,70,229,0.25);
    }
    .search-primary .search-icon { color: #4F46E5; }
    .search-primary input { color: #1E293B; }
    .search-primary input::placeholder { color: #6366F1; }
    .search-primary .clear-btn { color: #6366F1; }
    .search-primary .clear-btn:hover { color: #4F46E5; }

    /* Success Variant */
    .search-success {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .search-success.focused {
      border-color: #10B981;
      box-shadow: 0 0 0 4px rgba(16,185,129,0.25);
    }
    .search-success .search-icon { color: #10B981; }
    .search-success input { color: #1E293B; }
    .search-success input::placeholder { color: #34D399; }
    .search-success .clear-btn { color: #34D399; }
    .search-success .clear-btn:hover { color: #10B981; }

    /* Warning Variant */
    .search-warning {
      background: rgba(245, 158, 11, 0.05);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    .search-warning.focused {
      border-color: #F59E0B;
      box-shadow: 0 0 0 4px rgba(245,158,11,0.25);
    }
    .search-warning .search-icon { color: #F59E0B; }
    .search-warning input { color: #1E293B; }
    .search-warning input::placeholder { color: #FBBF24; }
    .search-warning .clear-btn { color: #FBBF24; }
    .search-warning .clear-btn:hover { color: #F59E0B; }

    /* Error Variant */
    .search-error {
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .search-error.focused {
      border-color: #EF4444;
      box-shadow: 0 0 0 4px rgba(239,68,68,0.25);
    }
    .search-error .search-icon { color: #EF4444; }
    .search-error input { color: #1E293B; }
    .search-error input::placeholder { color: #F87171; }
    .search-error .clear-btn { color: #F87171; }
    .search-error .clear-btn:hover { color: #EF4444; }

    /* Common Styles */
    .search-icon { position: absolute; left: 14px; width: 18px; height: 18px; }
    input {
      width: 100%; padding: 12px 14px 12px 42px; background: transparent;
      border: none; font-size: 14px; outline: none; font-family: inherit;
    }
    .clear-btn {
      position: absolute; right: 10px; background: none; border: none;
      padding: 4px; cursor: pointer;
    }
    .clear-btn:hover { cursor: pointer; }
  `],
})
export class UiSearchComponent {
  @Input() placeholder = 'Buscar...';
  @Input() value = '';
  @Input() variant: SearchVariant = 'default';
  @Output() searchChange = new EventEmitter<string>();

  isFocused = false;

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.searchChange.emit(val);
  }

  onClear() {
    this.value = '';
    this.searchChange.emit('');
  }
}
