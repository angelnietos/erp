import { Component, HostListener, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { UiSearchComponent } from '@josanz-erp/shared-ui-kit';
import { ThemeService, AuthStore } from '@josanz-erp/shared-data-access';

export interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  route?: string;
  action?: () => void;
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
      role="button"
    >
      <div class="palette-container animate-scale-in" (click)="$event.stopPropagation()" role="none">
        <ui-josanz-search 
          variant="glass" 
          placeholder="¿QUÉ DESEAS ENCONTRAR O HACER?" 
          (searchChange)="onSearch($event)"
          id="cmd-search"
        ></ui-josanz-search>

        <div class="results-area">
          @if (filteredItems().length === 0) {
            <div class="empty-state">
              <lucide-icon name="search-x" size="32" class="text-muted"></lucide-icon>
              <p class="text-uppercase text-muted">No se han encontrado resultados técnicos</p>
            </div>
          } @else {
            @for (cat of categories(); track cat) {
              <div class="category-group">
                <div class="category-label text-uppercase">{{ cat }}</div>
                @for (item of getItemsByCategory(cat); track item.id) {
                  <div 
                    class="command-item" 
                    (click)="executeCommand(item)"
                    (keydown.enter)="executeCommand(item)"
                    [class.active]="selectedId() === item.id"
                    tabindex="0"
                    role="button"
                  >
                    <div class="item-icon">
                      <lucide-icon [name]="item.icon" size="18"></lucide-icon>
                    </div>
                    <div class="item-info">
                      <span class="label text-uppercase">{{ item.label }}</span>
                      <span class="desc">{{ item.description }}</span>
                    </div>
                    <div class="item-shortcut">↵ ENTER</div>
                  </div>
                }
              </div>
            }
          }
        </div>

        <footer class="palette-footer">
          <div class="footer-hint">
            <kbd>↑↓</kbd> NAVEGAR
            <kbd>↵</kbd> EJECUTAR
            <kbd>ESC</kbd> SALIR
          </div>
          <div class="footer-logo text-uppercase">Josanz <span class="text-brand">Core</span></div>
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
    .category-label { font-size: 0.6rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.75rem; letter-spacing: 0.15em; padding-left: 0.5rem; }

    .command-item {
      display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 6px; cursor: pointer; transition: 0.2s;
      outline: none;
    }
    .command-item:hover, .command-item.active { background: rgba(240, 62, 62, 0.08); border-left: 3px solid var(--brand); }
    .command-item:focus { background: rgba(240, 62, 62, 0.05); }
    
    .item-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: 4px; color: var(--text-secondary); }
    .command-item:hover .item-icon, .command-item.active .item-icon { color: var(--brand); }

    .item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .item-info .label { font-size: 0.8rem; font-weight: 800; color: #fff; letter-spacing: 0.05em; }
    .item-info .desc { font-size: 0.65rem; color: var(--text-muted); }

    .item-shortcut { font-size: 0.6rem; color: var(--text-muted); font-weight: 800; opacity: 0; transition: 0.2s; }
    .command-item:hover .item-shortcut, .command-item.active .item-shortcut { opacity: 0.5; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem 0; }
    .empty-state p { font-size: 0.7rem; font-weight: 800; }

    .palette-footer {
      padding: 1rem; border-top: 1px solid var(--border-soft); background: rgba(0, 0, 0, 0.1);
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-hint { font-size: 0.6rem; color: var(--text-muted); font-weight: 800; display: flex; gap: 12px; }
    kbd { background: #000; padding: 2px 6px; border-radius: 3px; border: 1px solid var(--border-soft); color: var(--brand); }
    .footer-logo { font-size: 0.65rem; font-weight: 900; letter-spacing: 0.1em; color: var(--text-muted); }

    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0, 0, 0.2, 1); }
  `]
})
export class CommandPaletteComponent {
  closePalette = output<void>();
  private router = inject(Router);

  allItems: CommandItem[] = [
    { id: '1', label: 'Crear Presupuesto', description: 'Generar nuevo documento fiscal de cotización', icon: 'file-plus', category: 'Acciones Rápidas', route: '/budgets/create' },
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
    if (!term) {
      this.filteredItems.set(this.allItems);
      return;
    }
    const t = term.toLowerCase();
    this.filteredItems.set(this.allItems.filter(i => 
      i.label.toLowerCase().includes(t) || 
      i.description.toLowerCase().includes(t) ||
      i.category.toLowerCase().includes(t)
    ));
    if (this.filteredItems().length > 0) {
      this.selectedId.set(this.filteredItems()[0].id);
    }
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

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      this.moveSelection(1);
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.moveSelection(-1);
      event.preventDefault();
    } else if (event.key === 'Enter') {
      const selected = this.filteredItems().find(i => i.id === this.selectedId());
      if (selected) this.executeCommand(selected);
      event.preventDefault();
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
