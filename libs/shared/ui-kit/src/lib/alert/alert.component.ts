import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert animate-in" [class]="type">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .alert { padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; text-align: center; }
    .error { background: rgba(239, 68, 68, 0.15); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.2); }
    .success { background: rgba(16, 185, 129, 0.15); color: #6EE7B7; border: 1px solid rgba(16, 185, 129, 0.2); }
    .animate-in { animation: slide-up 0.3s ease-out; }
    @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class UiAlertComponent {
  @Input() type: 'error' | 'success' = 'error';
}
