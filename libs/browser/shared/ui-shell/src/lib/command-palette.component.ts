import { Component, HostListener, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { UiSearchComponent } from '@josanz-erp/shared-ui-kit';
import { ThemeService, MasterFilterService } from '@josanz-erp/shared-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';

export interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  route?: string;
  action?: () => void;
}

/** Shape of items returned by `MasterFilterService.results` (dynamic per module). */
function contextHitId(item: unknown): string {
  if (item && typeof item === 'object' && 'id' in item) {
    const v = (item as { id: unknown }).id;
    return v != null ? String(v) : '';
  }
  return '';
}

function contextHitLabel(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return 'Resultado';
  }
  const o = item as Record<string, unknown>;
  if (typeof o['name'] === 'string' && o['name'].trim()) {
    return o['name'];
  }
  if (typeof o['label'] === 'string' && o['label'].trim()) {
    return o['label'];
  }
  return 'Resultado';
}

function contextHitDescription(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return 'Ver detalle en el módulo actual';
  }
  const o = item as Record<string, unknown>;
  if (typeof o['description'] === 'string' && o['description'].trim()) {
    return o['description'];
  }
  return 'Ver detalle en el módulo actual';
}

@Component({
  selector: 'josanz-command-palette',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiSearchComponent],
  template: `
    <div 
      class="overlay animate-fade-in" 
      (click)="closePalette.emit()"
      (keydown.escape)="closePalette.emit()"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de comandos"
    >
      <div class="palette-container animate-scale-in" (click)="$event.stopPropagation()" role="none">
        <ui-search
          variant="glass"
          placeholder="Buscar módulos, acciones o ir a…"
          (searchChange)="onSearch($event)"
          id="cmd-search"
        ></ui-search>

        <div class="results-area">
          @if (filteredItems().length === 0 && contextResults().length === 0) {
            <div class="empty-state">
              <lucide-icon name="search-x" size="32" class="text-muted" aria-hidden="true"></lucide-icon>
              <p class="empty-title">Sin coincidencias</p>
              <p class="empty-hint">Prueba con otras palabras o revisa el módulo actual.</p>
            </div>
          } @else {
            @if (contextResults().length > 0) {
               <div class="category-group">
                 <div class="category-label">En este módulo</div>
                 @for (item of contextResults(); track $any(item).id) {
                    <div 
                      class="command-item context-hit" 
                      role="button"
                      tabindex="0"
                      (click)="executeContextItem(item)"
                      (keydown.enter)="executeContextItem(item)"
                      (keydown.space)="$event.preventDefault(); executeContextItem(item)"
                      [class.active]="selectedId() === 'ctx-' + $any(item).id"
                    >
                      <div class="item-icon ctx">
                        <lucide-icon name="arrow-right-circle" size="18"></lucide-icon>
                      </div>
                      <div class="item-info">
                        <span class="label">{{ $any(item).name || $any(item).label || 'Resultado' }}</span>
                        <span class="desc">{{ $any(item).description || 'Ver detalle en el módulo actual' }}</span>
                      </div>
                    </div>
                 }
               </div>
            }

            @for (cat of categories(); track cat) {
              <div class="category-group">
                <div class="category-label">{{ cat }}</div>
                @for (item of getItemsByCategory(cat); track item.id) {
                  <div 
                    class="command-item" 
                    (click)="executeCommand(item)"
                    (keydown.enter)="executeCommand(item)"
                    (keydown.space)="$event.preventDefault(); executeCommand(item)"
                    [class.active]="selectedId() === item.id"
                    tabindex="0"
                    role="button"
                  >
                    <div class="item-icon">
                      <lucide-icon [name]="item.icon" size="18" aria-hidden="true"></lucide-icon>
                    </div>
                    <div class="item-info">
                      <span class="label">{{ item.label }}</span>
                      <span class="desc">{{ item.description }}</span>
                    </div>
                    <div class="item-shortcut">Enter</div>
                  </div>
                }
              </div>
            }
          }
        </div>

        <footer class="palette-footer">
          <div class="footer-hint">
            <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
            <span><kbd>Enter</kbd> abrir</span>
            <span><kbd>Esc</kbd> cerrar</span>
          </div>
          <div class="footer-logo">Josanz <span class="text-brand">Core</span></div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: 15vh;
      outline: none;
    }

    .palette-container {
      width: 650px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      display: flex; flex-direction: column;
    }

    .results-area {
      max-height: 450px;
      overflow-y: auto;
      padding: 1rem;
    }

    .category-group { margin-bottom: 1.5rem; }
    .category-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 0.65rem;
      letter-spacing: 0.04em;
      padding-left: 0.5rem;
      text-transform: none;
    }

    .command-item {
      display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; transition: background 0.2s, border-color 0.2s;
      outline: none;
      border-left: 3px solid transparent;
    }
    .command-item:hover, .command-item.active { background: rgba(240, 62, 62, 0.08); border-left-color: var(--brand); }
    .command-item:focus-visible {
      background: rgba(240, 62, 62, 0.1);
      border-left-color: var(--brand);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand) 35%, transparent);
    }
    
    .item-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: 4px; color: var(--text-secondary); }
    .command-item:hover .item-icon, .command-item.active .item-icon { color: var(--brand); }

    .item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .item-info .label { font-size: 0.84rem; font-weight: 700; color: #fff; letter-spacing: 0.02em; text-transform: none; }
    .item-info .desc { font-size: 0.72rem; color: var(--text-muted); line-height: 1.35; }

    .item-shortcut { font-size: 0.62rem; color: var(--text-muted); font-weight: 600; opacity: 0; transition: opacity 0.2s; text-transform: none; }
    .command-item:hover .item-shortcut, .command-item.active .item-shortcut { opacity: 0.5; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 3.5rem 1rem; text-align: center; }
    .empty-title { font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); margin: 0; }
    .empty-hint { font-size: 0.78rem; font-weight: 500; color: var(--text-muted); margin: 0; max-width: 26ch; line-height: 1.45; }

    .palette-footer {
      padding: 1rem; border-top: 1px solid var(--border-soft); background: rgba(0, 0, 0, 0.1);
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;
    }
    .footer-hint {
      font-size: 0.68rem;
      color: var(--text-muted);
      font-weight: 600;
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem 1rem;
      align-items: center;
    }
    .footer-hint span {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    kbd {
      background: color-mix(in srgb, var(--text-primary) 8%, #0a0a0c);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      border: 1px solid var(--border-soft);
      color: var(--text-secondary);
      font-size: 0.62rem;
      font-weight: 700;
      font-family: var(--font-main);
    }
    .footer-logo { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; color: var(--text-muted); text-transform: none; }

    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0, 0, 0.2, 1); }

    @media (prefers-reduced-motion: reduce) {
      .animate-scale-in {
        animation: none;
      }
    }
  `]
})
export class CommandPaletteComponent {
  /** Exposed for template — narrow `unknown` context hits without `$any`. */
  readonly contextHitId = contextHitId;
  readonly contextHitLabel = contextHitLabel;
  readonly contextHitDescription = contextHitDescription;

  closePalette = output<void>();
  private router = inject(Router);

  allItems: CommandItem[] = [
    { id: '1', label: 'Crear Presupuesto', description: 'Generar nuevo documento fiscal de cotización', icon: 'file-plus', category: 'Acciones Rápidas', route: '/budgets/new' },
    { id: '2', label: 'Ver Inventario', description: 'Consultar stock y disponibilidad técnica', icon: 'package', category: 'Navegación', route: '/inventory' },
    { id: '3', label: 'Estado VeriFactu', description: 'Monitoreo de comunicaciones con AEAT', icon: 'shield-check', category: 'Fiscalidad', route: '/verifactu' },
    { id: '4', label: 'Gestionar Flota', description: 'Control de vehículos y logística', icon: 'truck', category: 'Logística', route: '/fleet' },
    { id: '5', label: 'Configuración ERP', description: 'Ajustes globales del sistema Core', icon: 'settings', category: 'Sistema', route: '/settings' },
    { id: '6', label: 'Alquileres Activos', description: 'Panel de expedientes en curso', icon: 'key', category: 'Navegación', route: '/rentals' },
    { id: '7', label: 'Nuevo Cliente', description: 'Dar de alta registro en base de datos', icon: 'user-plus', category: 'Acciones Rápidas', route: '/clients' },
    { id: '8', label: 'Alternar Tema', description: 'Cambiar entre modo día y noche (High Contrast)', icon: 'moon', category: 'Sistema', action: () => this.toggleTheme() },
    { id: '9', label: 'Cerrar Sesión', description: 'Finalizar instancia de trabajo actual', icon: 'log-out', category: 'Sistema', action: () => this.logout() },
  ];

  filteredItems = signal<CommandItem[]>(this.allItems);
  selectedId = signal<string>(this.allItems[0].id);

  private themeService = inject(ThemeService);
  private authStore = inject(AuthStore);
  private masterFilter = inject(MasterFilterService);

  contextResults = this.masterFilter.results;

  categories = computed(() => {
    const cats = new Set(this.filteredItems().map(i => i.category));
    return Array.from(cats);
  });

  toggleTheme() {
    const current = this.themeService.currentTheme();
    this.themeService.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  logout() {
    this.authStore.logout();
  }

  getItemsByCategory(cat: string) {
    return this.filteredItems().filter(i => i.category === cat);
  }

  onSearch(term: string) {
    const raw = term.trim();
    this.masterFilter.search(raw);

    if (!raw) {
      this.filteredItems.set(this.allItems);
      if (this.filteredItems().length > 0) {
        this.selectedId.set(this.filteredItems()[0].id);
      }
      return;
    }
    const t = raw.toLowerCase();
    const staticHits = this.allItems.filter(
      (i) =>
        i.label.toLowerCase().includes(t) ||
        i.description.toLowerCase().includes(t) ||
        i.category.toLowerCase().includes(t),
    );
    this.filteredItems.set(staticHits);
    if (this.filteredItems().length > 0) {
      this.selectedId.set(this.filteredItems()[0].id);
    }
  }

  executeContextItem(item: unknown) {
    void item;
    // Si tiene ruta específica en el objeto de negocio, la usamos, sino lógica dummy para el demo
    this.closePalette.emit();
  }

  executeCommand(item: CommandItem) {
    if (item.route) {
      this.router.navigateByUrl(item.route);
      this.closePalette.emit();
    } else if (item.action) {
      item.action();
      this.closePalette.emit();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onDocumentEscape(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.closePalette.emit();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: Event) {
    const e = event as KeyboardEvent;
    if (e.key === 'Escape') {
      return;
    }
    if (e.key === 'ArrowDown') {
      this.moveSelection(1);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      this.moveSelection(-1);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      const selected = this.filteredItems().find(i => i.id === this.selectedId());
      if (selected) this.executeCommand(selected);
      e.preventDefault();
    }
  }

  private moveSelection(dir: number) {
    const items = this.filteredItems();
    const idx = items.findIndex(i => i.id === this.selectedId());
    let nextIdx = idx + dir;
    if (nextIdx < 0) nextIdx = items.length - 1;
    if (nextIdx >= items.length) nextIdx = 0;
    this.selectedId.set(items[nextIdx].id);
  }
}
