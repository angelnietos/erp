import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { FilterTabsComponent } from './filter-tabs';
import { ButtonComponent } from './button';
import { SecondaryButtonComponent } from './secondary-button';
import { UserAvatarComponent } from './user-avatar';
import { PaginationComponent } from './pagination';

@Component({
  selector: 'josanz-main-list-layout',
  standalone: true,
  imports: [
    CommonModule, 
    FilterTabsComponent, 
    ButtonComponent, 
    SecondaryButtonComponent, 
    UserAvatarComponent, 
    PaginationComponent
  ],
  templateUrl: './main-list-layout.html',
  styleUrl: './main-list-layout.css',
})
export class MainListLayoutComponent implements OnChanges {
  readonly themeService = inject(JosanzThemeService);

  @Input() title = 'Título';
  @Input() primaryBtnLabel = 'Acción';
  @Input() filterOptions: string[] = ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'];

  /** Página actual de la lista (1-based). Solo se muestra paginación si `paginationTotal` > 0. */
  @Input() paginationPage = 1;
  /** Total de páginas; 0 oculta la paginación. */
  @Input() paginationTotal = 0;

  /** `figma`: control tipo `actual / total`; `numbered`: página con números. */
  @Input() paginationVariant: 'figma' | 'numbered' = 'figma';

  @Output() primaryAction = new EventEmitter<void>();
  @Output() excelAction = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() paginationChange = new EventEmitter<number>();

  /** Destino del avatar del header (vacío = sin enlace). */
  @Input() avatarLink: string | null = '/settings';
  @Input() avatarAriaLabel = 'Cuenta y ajustes';

  private _paginationPage = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paginationPage'] || changes['paginationTotal']) {
      const t = this.paginationTotal;
      const p = this.paginationPage;
      if (t > 0) {
        this._paginationPage = Math.min(t, Math.max(1, p));
      } else {
        this._paginationPage = 1;
      }
    }
  }

  onPaginationPage(page: number): void {
    this._paginationPage = page;
    this.paginationChange.emit(page);
  }

  get effectivePaginationPage(): number {
    return this._paginationPage;
  }

  onPrimaryAction() {
    this.primaryAction.emit();
  }

  onExcelAction() {
    this.excelAction.emit();
  }

  onFilterChange(option: string) {
    this.filterChange.emit(option);
  }
}
