import { Component, inject, HostListener, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AssistantSuggestion,
  IntelligentAssistantService,
} from '../services/intelligent-assistant.service';
import { BlockEngineService } from '../services/block-engine.service';

@Component({
  selector: 'app-zero-ui',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 8888;
      }

      .context-menu {
        position: fixed;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        padding: 8px 0;
        min-width: 200px;
        opacity: 0;
        transform: scale(0.95) translateY(-8px);
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
      }

      .context-menu.visible {
        opacity: 1;
        transform: scale(1) translateY(0);
        pointer-events: auto;
      }

      .menu-item {
        padding: 10px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: #1e293b;
        transition: background 0.1s;
      }

      .menu-item:hover {
        background: #f1f5f9;
      }

      .menu-item.danger {
        color: #dc2626;
      }

      .suggestion-badge {
        position: fixed;
        right: 24px;
        bottom: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 24px;
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        cursor: pointer;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        font-size: 14px;
        font-weight: 500;
      }

      .suggestion-badge.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .suggestion-badge:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 14px 48px rgba(102, 126, 234, 0.4);
      }

      .zen-overlay {
        position: fixed;
        inset: 0;
        background: white;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease;
      }

      .zen-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }

      .minimal-toolbar {
        position: fixed;
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .minimal-toolbar.visible {
        opacity: 1;
      }

      .toolbar-btn {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.15s;
      }

      .toolbar-btn:hover {
        background: white;
        transform: scale(1.08);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }

      .score-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: conic-gradient(
          #10b981 calc(var(--score) * 1%),
          #e2e8f0 calc(var(--score) * 1%)
        );
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.3s;
      }

      .score-indicator.visible {
        opacity: 1;
        transform: scale(1);
      }

      .score-inner {
        width: 52px;
        height: 52px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        color: #1e293b;
      }

      @keyframes breathe {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.03);
        }
      }

      .suggestion-badge {
        animation: breathe 3s ease-in-out infinite;
      }

      .suggestions-panel {
        position: fixed;
        right: 24px;
        bottom: 96px;
        width: min(360px, calc(100vw - 48px));
        max-height: min(420px, 50vh);
        overflow: auto;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(16px);
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(15, 23, 42, 0.18);
        padding: 0;
        z-index: 8890;
        pointer-events: auto;
        border: 1px solid rgba(226, 232, 240, 0.9);
      }

      .suggestions-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
        font-weight: 600;
        font-size: 14px;
        color: #0f172a;
        position: sticky;
        top: 0;
        background: rgba(255, 255, 255, 0.95);
      }

      .suggestions-panel-header button {
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
        padding: 4px 8px;
        color: #64748b;
        border-radius: 8px;
      }

      .suggestions-panel-header button:hover {
        background: #f1f5f9;
        color: #0f172a;
      }

      .suggestion-row {
        padding: 12px 16px;
        border-bottom: 1px solid #f1f5f9;
      }

      .suggestion-row:last-child {
        border-bottom: none;
      }

      .suggestion-row h4 {
        margin: 0 0 6px;
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
      }

      .suggestion-row p {
        margin: 0 0 10px;
        font-size: 12px;
        line-height: 1.45;
        color: #64748b;
      }

      .suggestion-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .suggestion-actions button {
        font-size: 12px;
        padding: 6px 12px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 500;
      }

      .suggestion-actions .apply {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .suggestion-actions .apply:hover {
        filter: brightness(1.05);
      }

      .suggestion-actions .discard {
        background: #f1f5f9;
        color: #475569;
      }

      .suggestion-actions .discard:hover {
        background: #e2e8f0;
      }
    `,
  ],
  template: `
    <div class="zen-overlay" [class.active]="assistant.zenMode()"></div>

    <div
      class="score-indicator"
      [class.visible]="assistant.analysis() && !assistant.zenMode()"
      [style.--score]="assistant.analysis()?.score || 0"
    >
      <div class="score-inner">{{ assistant.analysis()?.score || 0 }}</div>
    </div>

    <div class="minimal-toolbar" [class.visible]="!assistant.zenMode()">
      <button class="toolbar-btn" title="Deshacer" (click)="blockEngine.undo()">
        ↩️
      </button>
      <button class="toolbar-btn" title="Rehacer" (click)="blockEngine.redo()">
        ↪️
      </button>
      <button class="toolbar-btn" title="Zen Mode" (click)="toggleZen()">
        🧘
      </button>
    </div>

    @if (assistant.suggestions().length > 0 && !assistant.zenMode()) {
      <button
        type="button"
        class="suggestion-badge visible"
        (click)="$event.stopPropagation(); toggleSuggestionsPanel()"
      >
        💡 {{ assistant.suggestions().length }} sugerencias
      </button>
    }

    @if (suggestionsPanelOpen() && assistant.suggestions().length > 0 && !assistant.zenMode()) {
      <div
        class="suggestions-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Sugerencias del asistente"
        tabindex="-1"
        (click)="$event.stopPropagation()"
        (keydown)="onSuggestionsPanelKeydown($event)"
      >
        <div class="suggestions-panel-header">
          <span>Sugerencias</span>
          <button type="button" (click)="closeSuggestionsPanel()" aria-label="Cerrar">
            ×
          </button>
        </div>
        @for (s of assistant.suggestions(); track s.id) {
          <div class="suggestion-row">
            <h4>{{ s.title }}</h4>
            <p>{{ s.description }}</p>
            <div class="suggestion-actions">
              <button type="button" class="apply" (click)="applySuggestion(s)">
                Aplicar
              </button>
              <button type="button" class="discard" (click)="discardSuggestion(s)">
                Descartar
              </button>
            </div>
          </div>
        }
      </div>
    }

    <div
      class="context-menu"
      [class.visible]="menuVisible"
      [style.left.px]="menuX"
      [style.top.px]="menuY"
    >
      @for (item of menuItems; track item.id) {
        <button
          type="button"
          class="menu-item"
          [class.danger]="item.danger"
          (click)="executeAction(item.action)"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      }
    </div>
  `,
})
export class ZeroUiComponent {
  readonly assistant = inject(IntelligentAssistantService);
  readonly blockEngine = inject(BlockEngineService);

  readonly suggestionsPanelOpen = signal(false);

  menuVisible = false;
  menuX = 0;
  menuY = 0;

  menuItems = [
    {
      id: 'bold',
      icon: '𝗕',
      label: 'Negrita',
      action: (): void => {
        void 0;
      },
    },
    {
      id: 'italic',
      icon: '𝘐',
      label: 'Cursiva',
      action: (): void => {
        void 0;
      },
    },
    {
      id: 'heading',
      icon: 'H',
      label: 'Título',
      action: (): void => {
        void 0;
      },
    },
    {
      id: 'delete',
      icon: '🗑️',
      label: 'Eliminar',
      danger: true,
      action: (): void => {
        void 0;
      },
    },
  ];

  constructor() {
    effect(() => {
      if (this.assistant.zenMode()) {
        setTimeout(() => {
          document.documentElement.style.cursor = 'none';
        }, 1000);
      } else {
        document.documentElement.style.cursor = 'auto';
      }
    });

    effect(() => {
      if (this.assistant.suggestions().length === 0) {
        this.suggestionsPanelOpen.set(false);
      }
    });
  }

  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.menuVisible = true;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.menuVisible = false;
    this.suggestionsPanelOpen.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.assistant.notifyActivity();

    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        this.blockEngine.redo();
      } else {
        this.blockEngine.undo();
      }
    }
  }

  toggleZen(): void {
    this.assistant.toggle();
  }

  onSuggestionsPanelKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Escape') {
      this.closeSuggestionsPanel();
    }
  }

  toggleSuggestionsPanel(): void {
    this.suggestionsPanelOpen.update((open) => !open);
  }

  closeSuggestionsPanel(): void {
    this.suggestionsPanelOpen.set(false);
  }

  applySuggestion(s: AssistantSuggestion): void {
    s.apply();
    this.closeSuggestionsPanel();
  }

  discardSuggestion(s: AssistantSuggestion): void {
    s.discard();
  }

  executeAction(action: () => void): void {
    action();
    this.menuVisible = false;
  }
}
