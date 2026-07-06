import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InputComponent,
  MainDetailLayoutComponent,
  josanzNonEmptyTrim,
} from '@josanz-erp/josanz-ui';
import {
  FIGMA_CREATE_BILLING,
  FIGMA_CREATE_EQUIPMENT,
  FIGMA_CREATE_STAFF,
  FIGMA_CREATE_VEHICLE,
  type JosanzFigmaCreateConfig,
} from '@josanz-erp/josanz-events-data-access';

const CREATE_BY_SEGMENT: Record<string, JosanzFigmaCreateConfig> = {
  equipment: FIGMA_CREATE_EQUIPMENT,
  vehicles: FIGMA_CREATE_VEHICLE,
  staff: FIGMA_CREATE_STAFF,
  billing: FIGMA_CREATE_BILLING,
};

@Component({
  selector: 'josanz-figma-create-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    MainDetailLayoutComponent,
  ],
  templateUrl: './josanz-figma-create-page.html',
})
export class JosanzFigmaCreatePageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  config!: JosanzFigmaCreateConfig;
  form!: FormGroup;

  ngOnInit(): void {
    const segment = this.router.url.split('?')[0].split('/').filter(Boolean)[0] ?? 'equipment';
    this.config = CREATE_BY_SEGMENT[segment] ?? FIGMA_CREATE_EQUIPMENT;
    const controls: Record<string, unknown> = {};
    for (const section of this.config.sections) {
      for (const field of section.fields) {
        controls[field.controlName] = [
          '',
          field.type === 'date' ? Validators.required : josanzNonEmptyTrim,
        ];
      }
    }
    this.form = this.fb.group(controls);
  }

  onBack(): void {
    void this.router.navigate([this.config.listRoute]);
  }

  onSave(): void {
    if (this.form.valid) {
      void this.router.navigate([this.config.listRoute]);
    }
  }

  onCancel(): void {
    this.onBack();
  }
}
