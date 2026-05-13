import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzCornerInner, josanzCornerShell, type JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-main-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="shellClass()">
      @for (option of options; track option) {
        <button
          type="button"
          (click)="select(option)"
          [ngClass]="[tabCorner(), 'px-4 py-2 text-xs font-bold transition-all duration-300 whitespace-nowrap']"
          [class.bg-white]="active === option"
          [class.shadow-sm]="active === option"
          [class.text-slate-500]="active !== option"
          [class.text-blue-600]="active === option && !customColor"
          [class.hover:bg-slate-200/50]="active !== option"
          [style.color]="active === option && customColor ? customColor : null"
        >
          {{ option }}
        </button>
      }
    </div>
  `,
})
export class MainTabsComponent implements OnInit, OnChanges {
  @Input() options: string[] = [];
  /** Valor inicial / controlado desde el padre; el estado visual usa `active` para no pisarse al pulsar (p. ej. Storybook). */
  @Input() selection = '';
  @Output() selectionChange = new EventEmitter<string>();

  /** Esquinas del contenedor y de cada pestaña (misma semántica que `josanz-button`). */
  @Input() shape: JosanzControlShape = 'rounded';
  /** Color del texto de la pestaña activa (fondo sigue blanco). */
  @Input() customColor?: string;

  active = '';

  shellClass(): string {
    return `${josanzCornerShell(this.shape)} flex gap-1.5 p-1 bg-slate-100/50 w-fit border border-slate-200/50`;
  }

  tabCorner(): string {
    return josanzCornerInner(this.shape);
  }

  ngOnInit(): void {
    this.syncFromInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selection'] || changes['options']) {
      this.syncFromInputs();
    }
  }

  private syncFromInputs(): void {
    const opts = this.options ?? [];
    const sel = (this.selection ?? '').trim();
    if (sel && opts.includes(sel)) {
      this.active = sel;
    } else if (opts.length) {
      this.active = opts[0];
    } else {
      this.active = '';
    }
  }

  select(option: string): void {
    if (this.active === option) {
      return;
    }
    this.active = option;
    this.selectionChange.emit(option);
  }
}
