import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.92);
      padding: 24px;
    ">
      <div style="
        background: #FFFFFF;
        width: 712px;
        max-width: 100%;
        max-height: 90vh;
        border-radius: 8px;
        box-shadow: 0px 10px 24px rgba(97, 97, 97, 0.4);
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
      ">
        <!-- Close Button -->
        <button
          (click)="onClose()"
          style="
            position: absolute;
            top: 24px;
            right: 24px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            z-index: 10;
            opacity: 0.6;
            line-height: 1;
          "
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Scrollable Body -->
        <div class="modal-scroll-body" style="
          flex: 1;
          overflow-y: auto;
          padding: 48px 56px 24px 56px;
        ">
          <h2 style="
            font-size: 32px;
            font-weight: 700;
            color: #1A1A1A;
            margin: 0 0 32px 0;
            padding-right: 32px;
          ">{{ title }}</h2>
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div style="
          padding: 24px 56px 32px 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          background: #FFFFFF;
          flex-shrink: 0;
        ">
          <ng-content select="[footer-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-scroll-body::-webkit-scrollbar { display: none; }
    .modal-scroll-body { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ModalComponent {
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
