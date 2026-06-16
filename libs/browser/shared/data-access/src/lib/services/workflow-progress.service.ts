import { Injectable, computed, signal } from '@angular/core';

export type WorkflowProgressStatus = 'running' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class WorkflowProgressService {
  readonly active = signal(false);
  readonly title = signal('');
  readonly stepLabel = signal('');
  readonly currentStep = signal(0);
  readonly totalSteps = signal(0);
  readonly status = signal<WorkflowProgressStatus>('running');

  readonly percent = computed(() => {
    const total = this.totalSteps();
    if (total <= 0) return 0;
    return Math.min(100, Math.round((this.currentStep() / total) * 100));
  });

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  start(title: string, totalSteps: number): void {
    this.clearHideTimer();
    this.title.set(title);
    this.totalSteps.set(Math.max(1, totalSteps));
    this.currentStep.set(0);
    this.stepLabel.set('Iniciando…');
    this.status.set('running');
    this.active.set(true);
  }

  setStep(index: number, label: string): void {
    this.currentStep.set(index);
    this.stepLabel.set(label);
  }

  finish(ok: boolean, message?: string): void {
    this.status.set(ok ? 'success' : 'error');
    if (message) this.stepLabel.set(message);
    this.currentStep.set(this.totalSteps());
    this.hideTimer = setTimeout(() => this.reset(), ok ? 2400 : 4500);
  }

  reset(): void {
    this.clearHideTimer();
    this.active.set(false);
    this.currentStep.set(0);
    this.totalSteps.set(0);
    this.stepLabel.set('');
    this.title.set('');
    this.status.set('running');
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
