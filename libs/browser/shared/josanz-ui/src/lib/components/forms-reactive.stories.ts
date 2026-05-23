import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DatePickerComponent } from './date-picker';
import { FormFieldComponent } from './form-field';
import { PasswordInputComponent } from './password-input';
import { TextareaComponent } from './textarea';
import { ValidationMessageComponent } from './validation-message';

const meta: Meta = {
  title: 'Josanz UI / Forms / Reactive Example',
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        FormFieldComponent,
        TextareaComponent,
        DatePickerComponent,
        PasswordInputComponent,
        ValidationMessageComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Patrón recomendado: FormGroup de Angular + binding manual value/(valueChange) en controles Josanz hasta implementar ControlValueAccessor.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

export const ReactiveWorkOrderForm: Story = {
  render: () => {
    const form = new FormGroup({
      notes: new FormControl('', Validators.required),
      dueDate: new FormControl('', Validators.required),
      pin: new FormControl('', [Validators.required, Validators.minLength(4)]),
    });
    return {
      props: {
        form,
        submit(): void {
          form.markAllAsTouched();
        },
        patchNotes(value: string): void {
          form.get('notes')?.setValue(value);
          form.get('notes')?.markAsTouched();
        },
        patchDate(value: string): void {
          form.get('dueDate')?.setValue(value);
          form.get('dueDate')?.markAsTouched();
        },
        patchPin(value: string): void {
          form.get('pin')?.setValue(value);
          form.get('pin')?.markAsTouched();
        },
        notesError(): string {
          const c = form.get('notes');
          return c?.touched && c.invalid ? 'Las notas son obligatorias.' : '';
        },
        dateError(): string {
          const c = form.get('dueDate');
          return c?.touched && c.invalid ? 'Indica la fecha de entrega.' : '';
        },
        pinError(): string {
          const c = form.get('pin');
          if (!c?.touched || !c.invalid) {
            return '';
          }
          return c.hasError('minlength') ? 'Mínimo 4 caracteres.' : 'PIN requerido.';
        },
      },
      template: `
        <form class="grid max-w-lg gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);" (ngSubmit)="submit()">
          <h2 class="m-0 text-lg font-black" style="color: var(--josanz-text);">Orden de taller (reactive)</h2>
          <josanz-form-field label="Notas" [required]="true" [error]="notesError()">
            <josanz-textarea [value]="form.get('notes')?.value || ''" placeholder="Diagnóstico..." (valueChange)="patchNotes($event)"></josanz-textarea>
          </josanz-form-field>
          <josanz-form-field label="Fecha entrega" [required]="true" [error]="dateError()">
            <josanz-date-picker [value]="form.get('dueDate')?.value || ''" (valueChange)="patchDate($event)"></josanz-date-picker>
          </josanz-form-field>
          <josanz-form-field label="PIN supervisor" [required]="true" [error]="pinError()">
            <josanz-password-input [value]="form.get('pin')?.value || ''" (valueChange)="patchPin($event)"></josanz-password-input>
          </josanz-form-field>
          @if (form.invalid && form.touched) {
            <josanz-validation-message tone="warning" message="Completa los campos obligatorios antes de guardar."></josanz-validation-message>
          }
          <button type="submit" class="rounded-full px-4 py-2 text-sm font-black text-white" style="background: var(--josanz-primary);">Validar formulario</button>
        </form>
      `,
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Validar/i }));
    await expect(canvas.getByText(/obligatorias/i)).toBeVisible();
  },
};
