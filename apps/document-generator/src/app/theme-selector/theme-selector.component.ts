import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeManagerService, Theme } from '../services/theme-manager.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .theme-selector {
        position: fixed;
        right: max(20px, env(safe-area-inset-right));
        bottom: max(20px, env(safe-area-inset-bottom));
        z-index: 10500;
      }

      .theme-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: var(--surface);
        border: 1px solid var(--border-soft);
        box-shadow: var(--shadow-md);
        transition: all var(--transition-base);
        backdrop-filter: blur(16px);
      }

      .theme-btn:hover {
        transform: scale(1.1);
        box-shadow: var(--shadow-lg);
      }

      .theme-panel {
        position: absolute;
        right: 0;
        bottom: 60px;
        background: var(--surface);
        border: 1px solid var(--border-vibrant);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        padding: 16px;
        width: 380px;
        max-height: 80vh;
        overflow-y: auto;
        animation: scaleIn 0.15s ease forwards;
        transform-origin: bottom right;
        backdrop-filter: blur(24px);
      }

      .theme-panel.hidden {
        display: none;
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .theme-category {
        margin-bottom: 16px;
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
        padding: 12px 8px;
        border-radius: var(--radius-md);
        cursor: pointer;
        text-align: center;
        border: 2px solid transparent;
        transition: all var(--transition-fast);
        background: var(--bg-tertiary);
      }

      .theme-card:hover {
        background: var(--surface-hover);
        transform: translateY(-2px);
      }

      .theme-card.active {
        border-color: var(--brand);
        background: var(--brand-surface);
        box-shadow: 0 0 0 1px var(--brand-border-soft);
      }

      .theme-icon {
        font-size: 24px;
        margin-bottom: 6px;
      }

      .theme-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .variant-selector {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--border-soft);
      }

      .variant-btn {
        flex: 1;
        padding: 8px 4px;
        border-radius: var(--radius-md);
        border: none;
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .variant-btn:hover {
        background: var(--surface-hover);
      }

      .variant-btn.active {
        background: var(--brand);
        color: white;
      }
    `,
  ],
  template: `
    <div class="theme-selector">
      <button class="theme-btn" (click)="open = !open">
        {{ currentTheme().icon }}
      </button>

      <div class="theme-panel" [class.hidden]="!open">
        @for (category of categories; track category.id) {
          <div class="theme-category">
            <div class="category-title">{{ category.name }}</div>
            <div class="themes-grid">
              @for (theme of category.themes; track theme.id) {
                <div
                  class="theme-card"
                  [class.active]="currentTheme().id === theme.id"
                  (click)="selectTheme(theme)"
                >
                  <div class="theme-icon">{{ theme.icon }}</div>
                  <div class="theme-name">{{ theme.name }}</div>
                </div>
              }
            </div>
          </div>
        }

        <div class="variant-selector">
          @for (variant of variants; track variant.id) {
            <button
              class="variant-btn"
              [class.active]="currentTheme().uiVariant === variant.id"
              (click)="setVariant(variant.id)"
            >
              {{ variant.name }}
            </button>
          }
        </div>
      </div>
    </div>
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
    { id: 'neumorphic', name: '🔘 Neumorphic' },
    { id: 'minimal', name: '◻️ Minimal' },
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
