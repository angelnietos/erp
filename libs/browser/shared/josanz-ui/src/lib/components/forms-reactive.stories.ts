import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { CheckboxComponent } from './checkbox';
import { CurrencyInputComponent } from './currency-input';
import { DatePickerComponent } from './date-picker';
import { FormFieldComponent } from './form-field';
import { NumberInputComponent } from './number-input';
import { PasswordInputComponent } from './password-input';
import { PhoneInputComponent } from './phone-input';
import { SelectComponent } from './select';
import { SwitchComponent } from './switch';
import { TextareaComponent } from './textarea';
import { ValidationMessageComponent } from './validation-message';
import { MultiSelectComponent } from './multi-select';

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
        PhoneInputComponent,
        CurrencyInputComponent,
        NumberInputComponent,
        SelectComponent,
        MultiSelectComponent,
        CheckboxComponent,
        SwitchComponent,
        ValidationMessageComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'FormGroup con formControlName y CVA en textarea, date-picker, password, phone, currency, number, select, multi-select, checkbox y switch.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    form: { control: false, description: 'FormGroup reactivo que conecta todos los CVA de la suite.' },
    submit: sbEmit('submit', 'Submit del formulario'),
    notesError: { control: false, description: 'Calcula el error de notas.' },
    dateError: { control: false, description: 'Calcula el error de fecha.' },
    pinError: { control: false, description: 'Calcula el error de PIN.' },
    phoneError: { control: false, description: 'Calcula el error de teléfono.' },
    amountError: { control: false, description: 'Calcula el error de importe.' },
    branchError: { control: false, description: 'Calcula el error de sede.' },
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
      phone: new FormControl('+34'),
      amount: new FormControl<number | null>(null, Validators.required),
      units: new FormControl(1, [Validators.required, Validators.min(1)]),
      branch: new FormControl('', Validators.required),
      services: new FormControl<string[]>(['diagnosis']),
      urgent: new FormControl(false),
      notifyClient: new FormControl(true),
    });
    return {
      props: {
        form,
        submit(): void {
          form.markAllAsTouched();
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
        phoneError(): string {
          const c = form.get('phone');
          return c?.touched && c.invalid ? 'Teléfono obligatorio.' : '';
        },
        amountError(): string {
          const c = form.get('amount');
          return c?.touched && c.invalid ? 'Importe obligatorio.' : '';
        },
        branchError(): string {
          const c = form.get('branch');
          return c?.touched && c.invalid ? 'Selecciona delegación.' : '';
        },
        branchOptions: [
          { label: 'Madrid central', value: 'mad' },
          { label: 'Barcelona', value: 'bcn' },
          { label: 'Valencia', value: 'vlc' },
        ],
        serviceOptions: [
          { label: 'Diagnóstico', value: 'diagnosis' },
          { label: 'Cambio de aceite', value: 'oil' },
          { label: 'Revisión frenos', value: 'brakes' },
          { label: 'Alineación', value: 'alignment' },
        ],
      },
      template: `
        <form class="grid max-w-lg gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);" [formGroup]="form" (ngSubmit)="submit()">
          <h2 class="m-0 text-lg font-black" style="color: var(--josanz-text);">Orden de taller (reactive + CVA)</h2>
          <josanz-form-field label="Notas" [required]="true" [error]="notesError()">
            <josanz-textarea formControlName="notes" placeholder="Diagnóstico..."></josanz-textarea>
          </josanz-form-field>
          <josanz-form-field label="Fecha entrega" [required]="true" [error]="dateError()">
            <josanz-date-picker formControlName="dueDate"></josanz-date-picker>
          </josanz-form-field>
          <josanz-form-field label="Teléfono cliente" [error]="phoneError()">
            <josanz-phone-input formControlName="phone"></josanz-phone-input>
          </josanz-form-field>
          <josanz-form-field label="Importe presupuesto" [required]="true" [error]="amountError()">
            <josanz-currency-input formControlName="amount"></josanz-currency-input>
          </josanz-form-field>
          <josanz-form-field label="PIN supervisor" [required]="true" [error]="pinError()">
            <josanz-password-input formControlName="pin" [showStrength]="true"></josanz-password-input>
          </josanz-form-field>
          <josanz-form-field label="Unidades" [required]="true">
            <josanz-number-input formControlName="units" [min]="1" [max]="50"></josanz-number-input>
          </josanz-form-field>
          <josanz-form-field label="Delegación" [required]="true" [error]="branchError()">
            <josanz-select formControlName="branch" placeholder="Elegir..." [options]="branchOptions"></josanz-select>
          </josanz-form-field>
          <josanz-form-field label="Servicios incluidos">
            <josanz-multi-select formControlName="services" placeholder="Seleccionar servicios..." [options]="serviceOptions"></josanz-multi-select>
          </josanz-form-field>
          <josanz-checkbox formControlName="urgent" label="Orden urgente"></josanz-checkbox>
          <josanz-switch formControlName="notifyClient" label="Avisar al cliente por SMS"></josanz-switch>
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
