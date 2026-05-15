import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent, MainDetailLayoutComponent, josanzNonEmptyTrim } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-client-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, MainDetailLayoutComponent],
  templateUrl: './josanz-client-create.html',
  styleUrl: './josanz-client-create.css',
})
export class JosanzClientCreateComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);

  activeTab = signal<string>('Datos cliente');
  tabs = ['Datos cliente', 'Operadores', 'Eventos'];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      razonSocial: ['', josanzNonEmptyTrim],
      email: ['', [josanzNonEmptyTrim, Validators.email]],
      telefono: ['', josanzNonEmptyTrim],
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  onBack() {
    this.router.navigate(['/clients']);
  }

  onSave() {
    if (this.form.valid) {
      console.log('Creando cliente:', this.form.value);
      this.onBack();
    }
  }

  onCancel() {
    this.onBack();
  }
}
