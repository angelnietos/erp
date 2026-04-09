import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent } from '../../button/button.component';

@Component({
  selector: 'ui-feature-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiButtonComponent],
  template: `
    <div class="feature-header">
      <div class="header-content">
        <div class="title-section">
          <div class="icon-box" [style.background]="iconBackground">
            <lucide-icon [name]="icon" size="32"></lucide-icon>
          </div>
          <div class="text-box">
            <h1 class="main-title">{{ title }}</h1>
            <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
        </div>
        <div class="actions-section">
          <ng-content select="[actions]">
            <ui-button
              *ngIf="actionLabel"
              variant="solid"
              size="md"
              [icon]="actionIcon"
              (clicked)="actionClicked.emit()"
              class="primary-action"
            >
              {{ actionLabel }}
            </ui-button>
          </ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feature-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: var(--surface);
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }

    /* Glass effect */
    .header-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border-hover), transparent);
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .icon-box {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 24px -8px var(--brand-glow);
      flex-shrink: 0;
    }

    .main-title {
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-primary);
      background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 1rem;
      color: var(--text-muted);
      margin: 0.25rem 0 0 0;
      font-weight: 500;
    }

    .primary-action {
      background: linear-gradient(135deg, var(--brand), var(--brand-secondary));
      border: none;
      box-shadow: 0 4px 16px -4px var(--brand-glow);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .primary-action:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 24px -4px var(--brand-glow);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
        padding: 1.5rem;
      }
      
      .main-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class UiFeatureHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = 'layout';
  @Input() iconBackground = 'linear-gradient(135deg, var(--brand), var(--brand-secondary))';
  @Input() actionLabel = '';
  @Input() actionIcon = 'CirclePlus';
  
  @Output() actionClicked = new EventEmitter<void>();
}
