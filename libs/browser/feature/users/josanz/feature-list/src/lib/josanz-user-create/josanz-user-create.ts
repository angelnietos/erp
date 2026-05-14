import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InputComponent,
  UserAvatarComponent,
  MainDetailLayoutComponent
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    UserAvatarComponent,
    MainDetailLayoutComponent
  ],
  templateUrl: './josanz-user-create.html',
})
export class JosanzUserCreateComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  form: FormGroup;
  tabs = ['Datos usuario'];
  activeTab = 'Datos usuario';

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      empresa: [''],
      rol: ['Usuario'],
    });
  }

  onBack() {
    this.router.navigate(['/users']);
  }

  onSave() {
    if (this.form.valid) {
      console.log('Creando usuario:', this.form.value);
      this.onBack();
    }
  }

  onCancel() {
    this.onBack();
  }
}

