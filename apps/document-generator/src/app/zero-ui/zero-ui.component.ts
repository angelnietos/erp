import { Component, inject, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntelligentAssistantService } from '../services/intelligent-assistant.service';
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
        (click)="showSuggestions()"
      >
        💡 {{ assistant.suggestions().length }} sugerencias
      </button>
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

  showSuggestions(): void {
    console.log('Sugerencias:', this.assistant.suggestions());
  }

  executeAction(action: () => void): void {
    action();
    this.menuVisible = false;
  }
}
