import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MainDetailLayoutComponent
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-delivery-note-detail',
  standalone: true,
  imports: [
    CommonModule,
    MainDetailLayoutComponent
  ],
  templateUrl: './josanz-delivery-note-detail.html',
})
export class JosanzDeliveryNoteDetailComponent {
  private router = inject(Router);

  activeTab = signal<string>('General');
  tabs = ['General', 'Artículos', 'Firmas'];

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  onBack() {
    this.router.navigate(['/delivery-notes']);
  }

  onSave() {
    console.log('Guardando albarán...');
    this.onBack();
  }

  onCancel() {
    this.onBack();
  }
}
