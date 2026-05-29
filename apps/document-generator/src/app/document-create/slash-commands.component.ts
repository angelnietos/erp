import { Component, signal, viewChild, ElementRef, output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SlashCommand {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: 'blocks' | 'format' | 'media' | 'layout';
  action: () => void;
}

@Component({
  selector: 'app-slash-commands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .slash-menu {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
        max-height: 320px;
        overflow-y: auto;
        min-width: 280px;
        z-index: 1000;
      }

      .slash-menu-header {
        padding: 10px 14px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.7rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .slash-menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        cursor: pointer;
        transition: background 0.1s;
      }

      .slash-menu-item:hover,
      .slash-menu-item.selected {
        background: #f0f9ff;
      }

      .slash-menu-item-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border-radius: 8px;
        font-size: 1rem;
      }

      .slash-menu-item.selected .slash-menu-item-icon {
        background: #dbeafe;
      }

      .slash-menu-item-info {
        flex: 1;
        min-width: 0;
      }

      .slash-menu-item-label {
        font-size: 0.85rem;
        font-weight: 500;
        color: #0f172a;
      }

      .slash-menu-item-desc {
        font-size: 0.7rem;
        color: #64748b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .slash-menu-category {
        padding: 6px 14px;
        font-size: 0.65rem;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        background: #f8fafc;
        border-top: 1px solid #f1f5f9;
      }

      .slash-search-input {
        width: 100%;
        padding: 10px 14px;
        border: none;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.85rem;
        background: transparent;
      }

      .slash-search-input:focus {
        outline: none;
      }

      .slash-hint {
        padding: 8px 14px;
        font-size: 0.7rem;
        color: #94a3b8;
        border-top: 1px solid #f1f5f9;
        display: flex;
        gap: 0.75rem;
        justify-content: center;
      }

      .slash-hint kbd {
        padding: 2px 6px;
        background: #f1f5f9;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.65rem;
      }
    `,
  ],
  template: `
    <div class="slash-menu">
      <input
        #searchInput
        type="text"
        class="slash-search-input"
        placeholder="Buscar comando..."
        [(ngModel)]="searchQuery"
        (input)="filterCommands()"
      />

      @for (category of categories; track category.id) {
        @if (getFilteredCommandsByCategory(category.id).length > 0) {
          <div class="slash-menu-category">{{ category.label }}</div>
          @for (command of getFilteredCommandsByCategory(category.id); track command.id) {
            <div
              class="slash-menu-item"
              [class.selected]="selectedIndex() === getCommandIndex(command)"
              (click)="executeCommand(command)"
              (mouseenter)="selectedIndex.set(getCommandIndex(command))"
            >
              <div class="slash-menu-item-icon">{{ command.icon }}</div>
              <div class="slash-menu-item-info">
                <div class="slash-menu-item-label">{{ command.label }}</div>
                <div class="slash-menu-item-desc">{{ command.description }}</div>
              </div>
            </div>
          }
        }
      }

      <div class="slash-hint">
        <span><kbd>↑</kbd> <kbd>↓</kbd> navegar</span>
        <span><kbd>Enter</kbd> insertar</span>
        <span><kbd>Esc</kbd> cerrar</span>
      </div>
    </div>
  `,
})
export class SlashCommandsComponent implements OnInit, OnDestroy {
  searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  selectedIndex = signal(0);
  searchQuery = '';

  commands = signal<SlashCommand[]>([]);

  readonly categories = [
    { id: 'blocks' as const, label: 'Bloques' },
    { id: 'format' as const, label: 'Formato' },
    { id: 'media' as const, label: 'Multimedia' },
    { id: 'layout' as const, label: 'Diseño' },
  ];

  commandExecuted = output<SlashCommand>();
  dismissed = output<void>();

  private allCommands: SlashCommand[] = [];

  ngOnInit(): void {
    this.initializeCommands();
    setTimeout(() => {
      this.searchInput().nativeElement?.focus();
    }, 50);
  }

  private initializeCommands(): void {
    this.allCommands = [
      {
        id: 'heading1',
        label: 'Título Principal',
        icon: 'H1',
        description: 'Encabezado de primer nivel',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'heading2',
        label: 'Subtítulo',
        icon: 'H2',
        description: 'Encabezado de segundo nivel',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'heading3',
        label: 'Sección',
        icon: 'H3',
        description: 'Encabezado de tercer nivel',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'paragraph',
        label: 'Párrafo',
        icon: '¶',
        description: 'Bloque de texto normal',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'quote',
        label: 'Cita',
        icon: '"',
        description: 'Bloque de cita destacada',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'callout',
        label: 'Nota destacada',
        icon: '💡',
        description: 'Nota o advertencia importante',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'code',
        label: 'Código',
        icon: '</>',
        description: 'Bloque de código fuente',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'divider',
        label: 'Separador',
        icon: '—',
        description: 'Línea horizontal de separación',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'bold',
        label: 'Negrita',
        icon: 'B',
        description: 'Texto en negrita',
        category: 'format',
        action: () => {},
      },
      {
        id: 'italic',
        label: 'Cursiva',
        icon: 'I',
        description: 'Texto en cursiva',
        category: 'format',
        action: () => {},
      },
      {
        id: 'bullet-list',
        label: 'Lista',
        icon: '•',
        description: 'Lista con viñetas',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'numbered-list',
        label: 'Lista numerada',
        icon: '1.',
        description: 'Lista con números',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'checklist',
        label: 'Checklist',
        icon: '☑',
        description: 'Lista de tareas',
        category: 'blocks',
        action: () => {},
      },
      {
        id: 'table',
        label: 'Tabla',
        icon: '⊞',
        description: 'Insertar tabla personalizada',
        category: 'media',
        action: () => {},
      },
      {
        id: 'image',
        label: 'Imagen',
        icon: '🖼',
        description: 'Insertar imagen',
        category: 'media',
        action: () => {},
      },
      {
        id: 'link',
        label: 'Enlace',
        icon: '🔗',
        description: 'Insertar enlace externo',
        category: 'media',
        action: () => {},
      },
      {
        id: 'columns',
        label: 'Columnas',
        icon: '▐▌',
        description: 'Layout de dos columnas',
        category: 'layout',
        action: () => {},
      },
      {
        id: 'callout-info',
        label: 'Nota informativa',
        icon: 'ℹ️',
        description: 'Caja de información',
        category: 'layout',
        action: () => {},
      },
      {
        id: 'callout-warning',
        label: 'Advertencia',
        icon: '⚠️',
        description: 'Caja de advertencia',
        category: 'layout',
        action: () => {},
      },
      {
        id: 'callout-success',
        label: 'Éxito',
        icon: '✅',
        description: 'Caja de éxito o logro',
        category: 'layout',
        action: () => {},
      },
      {
        id: 'cover',
        label: 'Portada',
        icon: '📄',
        description: 'Portada del documento',
        category: 'layout',
        action: () => {},
      },
      {
        id: 'signatures',
        label: 'Firmas',
        icon: '✍️',
        description: 'Bloque de firmas',
        category: 'layout',
        action: () => {},
      },
    ];

    this.commands.set(this.allCommands);
  }

  filterCommands(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.commands.set(this.allCommands);
    } else {
      this.commands.set(
        this.allCommands.filter(
          (c) =>
            c.label.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query)
        )
      );
    }
    this.selectedIndex.set(0);
  }

  getFilteredCommandsByCategory(categoryId: string): SlashCommand[] {
    return this.commands().filter((c) => c.category === categoryId);
  }

  getCommandIndex(command: SlashCommand): number {
    return this.commands().findIndex((c) => c.id === command.id);
  }

  executeCommand(command: SlashCommand): void {
    this.commandExecuted.emit(command);
  }

  handleKeydown(event: KeyboardEvent): boolean {
    const commands = this.commands();
    const totalCommands = commands.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update((prev) => (prev + 1) % totalCommands);
        return true;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update((prev) => (prev - 1 + totalCommands) % totalCommands);
        return true;
      case 'Enter':
        event.preventDefault();
        if (commands[this.selectedIndex()]) {
          this.executeCommand(commands[this.selectedIndex()]);
        }
        return true;
      case 'Escape':
        event.preventDefault();
        this.dismissed.emit();
        return true;
    }

    return false;
  }

  setOnExecute(
    handlers: Record<string, () => void>
  ): void {
    this.allCommands.forEach((cmd) => {
      if (handlers[cmd.id]) {
        cmd.action = handlers[cmd.id];
      }
    });
    this.commands.set(this.allCommands);
  }

  ngOnDestroy(): void {
  }
}
