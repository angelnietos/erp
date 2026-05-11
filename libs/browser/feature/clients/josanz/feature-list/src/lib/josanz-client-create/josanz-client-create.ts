import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModalComponent,
  InputComponent,
  ButtonComponent,
} from '@josanz-erp/josanz-ui';

type ClientTab = 'datos' | 'operadores' | 'eventos';

@Component({
  selector: 'josanz-client-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './josanz-client-create.html',
  styleUrl: './josanz-client-create.css',
})
export class JosanzClientCreateComponent {
  @Output() close = new EventEmitter<void>();

  activeTab = signal<ClientTab>('datos');

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      razonSocial: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
    });
  }

  setTab(tab: ClientTab) {
    this.activeTab.set(tab);
  }

  onSave() {
    if (this.form.valid) {
      console.log('Guardando cliente:', this.form.value);
      this.close.emit();
    }
  }

  onCancel() {
    this.close.emit();
  }
}
