import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JOSANZ_LIST_VIEW_MENU_OPTIONS,
  listViewSelectionLabel,
  type JosanzListViewSelection,
} from '../list-view/list-view-preferences';

@Component({
  selector: 'josanz-list-view-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-view-selector.html',
  styleUrl: './list-view-selector.css',
})
export class ListViewSelectorComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() label = 'Vista';
  @Input() selected: JosanzListViewSelection = 'tarjetas-lista';

  @Output() selectionChange = new EventEmitter<JosanzListViewSelection>();

  readonly open = signal(false);

  readonly allOptions = JOSANZ_LIST_VIEW_MENU_OPTIONS;

  get summaryLabel(): string {
    return listViewSelectionLabel(this.selected);
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  pick(option: JosanzListViewSelection, event: Event): void {
    event.stopPropagation();
    this.open.set(false);
    this.selectionChange.emit(option);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
