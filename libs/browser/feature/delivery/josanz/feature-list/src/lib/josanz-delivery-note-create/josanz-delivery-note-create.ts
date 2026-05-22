import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent, MainDetailLayoutComponent, josanzNonEmptyTrim } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-delivery-note-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    MainDetailLayoutComponent
  ],
  templateUrl: './josanz-delivery-note-create.html',
})
export class JosanzDeliveryNoteCreateComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);

  activeTab = signal<string>('Datos entrega');
  tabs = ['Datos entrega'];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      cliente: ['', josanzNonEmptyTrim],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      direccion: ['', josanzNonEmptyTrim],
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  onBack() {
    this.router.navigate(['/delivery-notes']);
  }

  onSave() {
    if (this.form.valid) {
      console.log('Creando albarán:', this.form.value);
      this.onBack();
    }
  }

  onCancel() {
    this.onBack();
  }
}
