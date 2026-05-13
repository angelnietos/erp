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
          [ngClass]="[tabCorner(), 'px-4 py-2 text-xs font-semibold transition-all duration-300 whitespace-nowrap']"
          [class.bg-white]="true"
          [class.border]="true"
          [class.border-[#222222]]="active === option && !customColor"
          [class.text-[#222222]]="active === option && !customColor"
          [class.border-transparent]="active !== option"
          [class.text-[#989898]]="active !== option"
          [style.color]="active === option && customColor ? customColor : null"
          [style.borderColor]="active === option && customColor ? customColor : null"
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
    return `flex gap-2 w-fit`;
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
