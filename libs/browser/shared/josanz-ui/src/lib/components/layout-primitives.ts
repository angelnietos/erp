import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'josanz-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="mx-auto w-full px-4"
      [ngClass]="maxWidthClass()"
      [attr.aria-label]="ariaLabel || null"
    >
      <ng-content></ng-content>
    </section>
  `,
})
export class ContainerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  @Input() ariaLabel = '';

  maxWidthClass(): string {
    return {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[1440px]',
      full: 'max-w-none',
    }[this.size];
  }
}

@Component({
  selector: 'josanz-stack',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex" [ngClass]="stackClass()" [style.gap]="gap">
      <ng-content></ng-content>
    </div>
  `,
})
export class StackComponent {
  @Input() direction: 'vertical' | 'horizontal' = 'vertical';
  @Input() gap = '1rem';
  @Input() align: 'start' | 'center' | 'end' | 'stretch' = 'stretch';
  @Input() justify: 'start' | 'center' | 'between' | 'end' = 'start';

  stackClass(): string {
    const direction =
      this.direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col';
    const align = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    }[this.align];
    const justify = {
      start: 'justify-start',
      center: 'justify-center',
      between: 'justify-between',
      end: 'justify-end',
    }[this.justify];
    return `${direction} ${align} ${justify}`;
  }
}

@Component({
  selector: 'josanz-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="grid"
      [style.gridTemplateColumns]="gridTemplate()"
      [style.gap]="gap"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class GridComponent {
  @Input() columns = 3;
  @Input() minColumnWidth = '';
  @Input() gap = '1rem';

  gridTemplate(): string {
    return this.minColumnWidth
      ? `repeat(auto-fit, minmax(${this.minColumnWidth}, 1fr))`
      : `repeat(${Math.max(1, this.columns)}, minmax(0, 1fr))`;
  }
}

@Component({
  selector: 'josanz-spacer',
  standalone: true,
  template: `<span
    aria-hidden="true"
    [style.display]="block ? 'block' : 'inline-block'"
    [style.width]="width"
    [style.height]="height"
  ></span>`,
})
export class SpacerComponent {
  @Input() width = '1rem';
  @Input() height = '1rem';
  @Input() block = true;
}
