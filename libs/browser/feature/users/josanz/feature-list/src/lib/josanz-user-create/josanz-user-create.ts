import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ModalComponent,
  InputComponent,
  ButtonComponent,
  UserAvatarComponent,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    InputComponent,
    ButtonComponent,
    UserAvatarComponent,
  ],
  templateUrl: './josanz-user-create.html',
  styleUrl: './josanz-user-create.css',
})
export class JosanzUserCreateComponent {
  @Output() close = new EventEmitter<void>();
  
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      empresa: [''],
      rol: ['Usuario'],
    });
  }

  onSave() {
    if (this.form.valid) {
      console.log('Guardando usuario:', this.form.value);
      this.close.emit();
    }
  }

  onCancel() {
    this.close.emit();
  }
}
