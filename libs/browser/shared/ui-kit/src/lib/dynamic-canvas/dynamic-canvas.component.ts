import { Component, Input, OnChanges, SimpleChanges, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'ui-josanz-dynamic-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dynamic-canvas-container" [innerHTML]="safeHtml"></div>
  `,
  styles: [`
    .dynamic-canvas-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none; /* Allows interacting with underlying elements by default */
      z-index: 10;
      overflow: hidden;
    }
  `],
  encapsulation: ViewEncapsulation.None, // Allow injected styles to affect the innerHTML
})
export class DynamicCanvasComponent implements OnChanges {
  @Input() htmlRef: string = '';
  
  private sanitizer = inject(DomSanitizer);
  safeHtml: SafeHtml = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['htmlRef']) {
      // By using bypassSecurityTrustHtml, we allow animation frames, style tags, SVG, etc.
      this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.htmlRef || '');
    }
  }
}
