import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeManagerService, Theme } from '../services/theme-manager.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .theme-backdrop {
        position: fixed;
        inset: 0;
        z-index: 10490;
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }

      .theme-fab {
        position: fixed;
        right: max(20px, env(safe-area-inset-right));
        bottom: max(20px, env(safe-area-inset-bottom));
        z-index: 10502;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1px solid var(--border-soft);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: var(--surface);
        box-shadow: var(--shadow-md);
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        backdrop-filter: blur(16px);
      }

      .theme-fab:hover {
        transform: scale(1.06);
        box-shadow: var(--shadow-lg);
      }

      .theme-panel {
        position: fixed;
        right: max(20px, env(safe-area-inset-right));
        bottom: calc(max(20px, env(safe-area-inset-bottom)) + 56px);
        z-index: 10501;
        width: min(380px, calc(100vw - 32px));
        max-height: min(80vh, 640px);
        display: flex;
        flex-direction: column;
        background: var(--surface);
        border: 1px solid var(--border-vibrant);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
        animation: scaleIn 0.18s ease forwards;
        transform-origin: bottom right;
        backdrop-filter: blur(24px);
      }

      .theme-panel.hidden {
        display: none;
      }

      .theme-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-bottom: 1px solid var(--border-soft);
        background: color-mix(in srgb, var(--bg-secondary) 92%, transparent);
      }

      .theme-panel-title {
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-secondary);
      }

      .theme-close {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: 1.1rem;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        background: color-mix(in srgb, var(--text-primary) 6%, transparent);
        transition:
          background var(--transition-fast),
          color var(--transition-fast);
      }

      .theme-close:hover {
        color: var(--text-primary);
        background: color-mix(in srgb, var(--text-primary) 12%, transparent);
      }

      .theme-panel-body {
        padding: 12px 14px 14px;
        overflow-y: auto;
        overscroll-behavior: contain;
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.94) translateY(6px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .theme-category {
        margin-bottom: 14px;
      }

      .category-title {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--text-muted);
        margin-bottom: 10px;
        padding-left: 4px;
      }

      .themes-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .theme-card {
        margin: 0;
        padding: 10px 6px;
        border-radius: var(--radius-md);
        cursor: pointer;
        text-align: center;
        border: 2px solid transparent;
        font: inherit;
        appearance: none;
        transition:
          transform var(--transition-fast),
          box-shadow var(--transition-fast),
          border-color var(--transition-fast);
      }

      .theme-card:hover {
        transform: translateY(-2px);
        filter: brightness(1.06);
      }

      .theme-card:focus-visible {
        outline: 2px solid var(--brand);
        outline-offset: 2px;
      }

      .theme-icon {
        font-size: 22px;
        margin-bottom: 4px;
        line-height: 1.2;
      }

      .theme-name {
        font-size: 10px;
        font-weight: 700;
        line-height: 1.25;
        word-break: break-word;
      }

      .variant-selector {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 4px;
        padding-top: 12px;
        border-top: 1px solid var(--border-soft);
      }

      .variant-btn {
        flex: 1;
        min-width: 72px;
        padding: 8px 4px;
        border-radius: var(--radius-md);
        border: none;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .variant-btn:hover {
        filter: brightness(1.08);
      }
    `,
  ],
  template: `
    @if (open) {
      <div
        class="theme-backdrop"
        role="presentation"
        (click)="close()"
        aria-hidden="true"
      ></div>
    }

    <button
      type="button"
      class="theme-fab"
      (click)="toggle($event)"
      [attr.aria-expanded]="open"
      [attr.aria-haspopup]="true"
      [attr.aria-controls]="'theme-panel-dialog'"
      [attr.aria-label]="
        'Temas visuales, tema actual: ' + currentTheme().name
      "
      title="Temas visuales"
    >
      <span aria-hidden="true">{{ currentTheme().icon }}</span>
    </button>

    @if (open) {
    <div
      id="theme-panel-dialog"
      class="theme-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Selector de tema"
      tabindex="-1"
      (click)="$event.stopPropagation()"
      (keydown)="$event.stopPropagation()"
    >
      <div class="theme-panel-header">
        <span class="theme-panel-title">Tema visual</span>
        <button
          type="button"
          class="theme-close"
          (click)="close()"
          aria-label="Cerrar selector de temas"
        >
          ✕
        </button>
      </div>
      <div class="theme-panel-body">
        @for (category of categories; track category.id) {
          <div class="theme-category">
            <div class="category-title">{{ category.name }}</div>
            <div class="themes-grid">
              @for (theme of category.themes; track theme.id) {
                <button
                  type="button"
                  class="theme-card"
                  [class.active]="currentTheme().id === theme.id"
                  [style.background]="theme.colors.bgSecondary"
                  [style.border-color]="
                    currentTheme().id === theme.id
                      ? theme.colors.brand
                      : 'transparent'
                  "
                  [style.box-shadow]="
                    currentTheme().id === theme.id
                      ? '0 0 0 1px ' + theme.colors.brand + ', 0 6px 20px rgba(0,0,0,.2)'
                      : 'none'
                  "
                  (click)="selectTheme(theme)"
                >
                  <div
                    class="theme-icon"
                    [style.color]="theme.colors.accent"
                  >
                    {{ theme.icon }}
                  </div>
                  <div
                    class="theme-name"
                    [style.color]="theme.colors.textPrimary"
                  >
                    {{ theme.name }}
                  </div>
                </button>
              }
            </div>
          </div>
        }

        <div class="variant-selector">
          @for (variant of variants; track variant.id) {
            <button
              type="button"
              class="variant-btn"
              [style.background]="
                currentTheme().uiVariant === variant.id
                  ? 'var(--brand)'
                  : 'var(--bg-tertiary)'
              "
              [style.color]="
                currentTheme().uiVariant === variant.id
                  ? 'var(--text-on-brand, #fff)'
                  : 'var(--text-secondary)'
              "
              [style.box-shadow]="
                currentTheme().uiVariant === variant.id
                  ? '0 0 0 2px var(--brand)'
                  : 'none'
              "
              (click)="setVariant(variant.id)"
            >
              {{ variant.name }}
            </button>
          }
        </div>
      </div>
    </div>
    }
  `,
})
export class ThemeSelectorComponent {
  private readonly themeManager = inject(ThemeManagerService);

  open = false;
  readonly currentTheme = this.themeManager.currentTheme;

  readonly variants = [
    { id: 'glass', name: '✨ Glass' },
    { id: 'solid', name: '⬛ Solid' },
    { id: 'flat', name: '🔲 Flat' },
    { id: 'neumorphic', name: '🔘 Neo' },
    { id: 'minimal', name: '◻️ Min' },
  ];

  readonly categories = [
    {
      id: 'dark',
      name: '🌙 Temas Oscuros',
      themes: this.themeManager.getThemesByCategory()['dark'],
    },
    {
      id: 'light',
      name: '☀️ Temas Claros',
      themes: this.themeManager.getThemesByCategory()['light'],
    },
    {
      id: 'colorful',
      name: '🎨 Temas Coloridos',
      themes: this.themeManager.getThemesByCategory()['colorful'],
    },
  ];

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape' && this.open) {
      this.close();
      ev.preventDefault();
    }
  }

  toggle(ev: MouseEvent): void {
    ev.stopPropagation();
    this.open = !this.open;
  }

  close(): void {
    this.open = false;
  }

  selectTheme(theme: Theme): void {
    this.themeManager.setTheme(theme);
  }

  setVariant(variantId: string): void {
    const current = this.currentTheme();
    this.themeManager.setTheme({
      ...current,
      uiVariant: variantId as Theme['uiVariant'],
    });
  }
}
