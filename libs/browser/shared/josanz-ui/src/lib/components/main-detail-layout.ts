import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { MainTabsComponent } from './main-tabs';
import { ButtonComponent } from './button';

@Component({
  selector: 'josanz-main-detail-layout',
  standalone: true,
  imports: [CommonModule, MainTabsComponent, ButtonComponent],
  template: `
    <div 
      class="flex flex-col h-full min-h-screen relative"
      [style.backgroundColor]="'var(--josanz-bg)'"
    >
      <!-- Header Section -->
      <div class="px-5 md:px-10 pt-8 md:pt-10 pb-6 flex flex-col gap-6">
        <div class="flex items-center gap-4">
          <button 
            type="button" 
            (click)="back.emit()"
            class="p-2 -ml-2 rounded-full hover:bg-[rgba(0,0,0,0.05)] transition-colors"
            [style.color]="'var(--josanz-text)'"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 
            class="text-[28px] md:text-[32px] font-bold tracking-tight"
            [style.color]="'var(--josanz-text)'"
          >
            {{ title }}
          </h1>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="w-full md:w-auto overflow-x-auto no-scrollbar">
            <josanz-main-tabs 
              [options]="tabs" 
              [selection]="activeTab"
              (selectionChange)="tabChange.emit($event)"
            ></josanz-main-tabs>
          </div>
          
          <div class="flex items-center gap-2 md:justify-end">
            <ng-content select="[header-actions]"></ng-content>
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-5 md:px-10 pb-40 md:pb-32 no-scrollbar">
        <ng-content></ng-content>
      </div>

      <!-- Fixed Footer -->
      <div 
        class="fixed bottom-0 left-0 md:left-[68px] right-0 h-auto md:h-[100px] flex flex-col md:flex-row items-center justify-end px-5 md:px-10 py-6 md:py-0 gap-3 md:gap-6 z-50 border-t backdrop-blur-md transition-all duration-300"
        [style.backgroundColor]="themeService.currentTheme().atmosphere.glass ? 'var(--josanz-glass)' : 'var(--josanz-surface)'"
        [style.borderColor]="'var(--josanz-border)'"
        [style.boxShadow]="'0 -10px 30px rgba(0,0,0,0.1)'"
      >
        <div class="w-full md:w-auto order-2 md:order-1">
          <josanz-button 
            [label]="cancelLabel" 
            variant="ghost" 
            size="lg" 
            [showIcon]="false" 
            [fullWidth]="true"
            (btnClick)="cancel.emit()"
          ></josanz-button>
        </div>
        <div class="w-full md:w-auto order-1 md:order-2">
          <josanz-button 
            [label]="saveLabel" 
            size="lg" 
            [showIcon]="false" 
            [fullWidth]="true"
            (btnClick)="save.emit()"
          ></josanz-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class MainDetailLayoutComponent {
  public themeService = inject(JosanzThemeService);

  @Input() title = '';
  @Input() tabs: string[] = [];
  @Input() activeTab = '';
  @Input() saveLabel = 'Guardar cambios';
  @Input() cancelLabel = 'Cancelar';

  @Output() back = new EventEmitter<void>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
