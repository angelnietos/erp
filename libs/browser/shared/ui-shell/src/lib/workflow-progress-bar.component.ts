import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  Workflow,
} from 'lucide-angular';
import { WorkflowProgressService } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'josanz-workflow-progress-bar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (progress.active()) {
      <div
        class="wf-progress"
        role="progressbar"
        [attr.aria-valuenow]="progress.percent()"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-label]="progress.title()"
      >
        <div class="wf-progress__head">
          <div class="wf-progress__title-row">
            @if (progress.status() === 'running') {
              <lucide-icon
                [img]="IconLoader"
                size="16"
                class="wf-progress__icon spin"
                aria-hidden="true"
              />
            } @else if (progress.status() === 'success') {
              <lucide-icon
                [img]="IconCheck"
                size="16"
                class="wf-progress__icon ok"
                aria-hidden="true"
              />
            } @else {
              <lucide-icon
                [img]="IconAlert"
                size="16"
                class="wf-progress__icon err"
                aria-hidden="true"
              />
            }
            <lucide-icon
              [img]="IconWorkflow"
              size="14"
              class="wf-progress__wf-icon"
              aria-hidden="true"
            />
            <strong>{{ progress.title() }}</strong>
          </div>
          <span class="wf-progress__pct">{{ progress.percent() }}%</span>
        </div>

        <div class="wf-progress__track">
          <div
            class="wf-progress__fill"
            [class.ok]="progress.status() === 'success'"
            [class.err]="progress.status() === 'error'"
            [style.width.%]="progress.percent()"
          ></div>
        </div>

        <p class="wf-progress__step">
          @if (progress.currentStep() > 0 && progress.status() === 'running') {
            Paso {{ progress.currentStep() }}/{{ progress.totalSteps() }} —
          }
          {{ progress.stepLabel() }}
        </p>
      </div>
    }
  `,
  styles: [
    `
      .wf-progress {
        position: fixed;
        top: calc(var(--app-header-height, 3.5rem) + 0.65rem);
        left: 50%;
        transform: translateX(-50%);
        z-index: 2999;
        width: min(520px, calc(100vw - 2rem));
        padding: 0.75rem 1rem 0.85rem;
        border-radius: 14px;
        border: 1px solid color-mix(in srgb, var(--brand, #14b8a6) 28%, transparent);
        background: color-mix(in srgb, var(--surface, #12121a) 92%, transparent);
        backdrop-filter: blur(14px);
        box-shadow:
          0 16px 48px rgba(0, 0, 0, 0.35),
          0 0 0 1px rgba(255, 255, 255, 0.04) inset;
        animation: wf-progress-in 0.24s ease-out;
        pointer-events: none;
      }

      .wf-progress__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.55rem;
      }

      .wf-progress__title-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        min-width: 0;
      }

      .wf-progress__title-row strong {
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wf-progress__wf-icon {
        opacity: 0.55;
        flex-shrink: 0;
      }

      .wf-progress__icon {
        flex-shrink: 0;
      }

      .wf-progress__icon.ok {
        color: var(--success, #22c55e);
      }

      .wf-progress__icon.err {
        color: var(--danger, #ef4444);
      }

      .wf-progress__pct {
        font-size: 0.72rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: var(--brand, #14b8a6);
        flex-shrink: 0;
      }

      .wf-progress__track {
        height: 6px;
        border-radius: 999px;
        overflow: hidden;
        background: color-mix(in srgb, var(--border-soft, #333) 70%, transparent);
      }

      .wf-progress__fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(
          90deg,
          color-mix(in srgb, var(--brand, #14b8a6) 85%, #fff),
          var(--brand, #14b8a6)
        );
        transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        box-shadow: 0 0 12px color-mix(in srgb, var(--brand, #14b8a6) 45%, transparent);
      }

      .wf-progress__fill.ok {
        background: linear-gradient(90deg, #4ade80, var(--success, #22c55e));
        box-shadow: 0 0 12px color-mix(in srgb, var(--success, #22c55e) 45%, transparent);
      }

      .wf-progress__fill.err {
        background: linear-gradient(90deg, #f87171, var(--danger, #ef4444));
        box-shadow: 0 0 12px color-mix(in srgb, var(--danger, #ef4444) 45%, transparent);
      }

      .wf-progress__step {
        margin: 0.45rem 0 0;
        font-size: 0.74rem;
        line-height: 1.35;
        color: var(--text-muted, #a1a1aa);
      }

      .spin {
        animation: wf-spin 0.9s linear infinite;
      }

      @keyframes wf-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes wf-progress-in {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .wf-progress {
          animation: none;
        }
        .wf-progress__fill {
          transition: none;
        }
        .spin {
          animation: none;
        }
      }
    `,
  ],
})
export class WorkflowProgressBarComponent {
  readonly progress = inject(WorkflowProgressService);
  readonly IconLoader = LoaderCircle;
  readonly IconCheck = CheckCircle;
  readonly IconAlert = AlertCircle;
  readonly IconWorkflow = Workflow;
}
