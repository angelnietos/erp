import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ChipInputComponent } from './chip-input';
import { FormFieldComponent } from './form-field';
import { NumberInputComponent } from './number-input';
import { PasswordInputComponent } from './password-input';
import { TextareaComponent } from './textarea';

const meta: Meta<FormFieldComponent> = {
  component: FormFieldComponent,
  title: 'Josanz UI / Forms / Field Wrapper',
  decorators: [
    moduleMetadata({
      imports: [
        FormFieldComponent,
        TextareaComponent,
        NumberInputComponent,
        PasswordInputComponent,
        ChipInputComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Envoltorio accesible para controles: etiqueta, hint, error y proyección de contenido.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta visible del campo' },
    hint: { control: 'text', description: 'Ayuda contextual bajo el control' },
    error: { control: 'text', description: 'Mensaje de error; tiene prioridad sobre `hint`' },
    errorTone: {
      control: 'inline-radio',
      options: ['danger', 'warning'],
      description: 'Tono visual del mensaje de error',
    },
    required: { control: 'boolean', description: 'Muestra indicador de campo obligatorio' },
    disabled: { control: 'boolean', description: 'Estado visual deshabilitado del wrapper' },
    fieldId: { control: 'text', description: 'ID usado para asociar etiqueta y control proyectado' },
  },
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  args: {
    label: 'Nombre fiscal',
    hint: 'Debe coincidir con la ficha de facturación.',
    error: '',
    required: true,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="max-w-lg rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-form-field
          [label]="label"
          [hint]="hint"
          [error]="error"
          [required]="required"
          [disabled]="disabled"
        >
          <josanz-textarea placeholder="Razón social o nombre comercial..."></josanz-textarea>
        </josanz-form-field>
      </section>
    `,
  }),
};

export const ValidationStates: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-5 md:grid-cols-2">
        <josanz-form-field label="Importe presupuesto" required error="El importe debe ser superior a 0.">
          <josanz-number-input [value]="0" [min]="1" [max]="50000"></josanz-number-input>
        </josanz-form-field>
        <josanz-form-field label="Fecha entrega" error="La fecha cae fuera del horario de almacén." errorTone="warning">
          <josanz-textarea value="Viernes 21:00" placeholder="Fecha estimada"></josanz-textarea>
        </josanz-form-field>
        <josanz-form-field label="Notas internas" hint="Visible solo para taller y administración.">
          <josanz-textarea value="Revisar documentación antes de facturar."></josanz-textarea>
        </josanz-form-field>
        <josanz-form-field label="PIN supervisor" hint="Campo deshabilitado hasta seleccionar responsable" [disabled]="true">
          <josanz-password-input value="1234"></josanz-password-input>
        </josanz-form-field>
      </div>
    `,
  }),
};

export const FormFieldSuite: Story = {
  args: {
    valueChange: fn(),
    tagsChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Mostrar/i }));
    await expect(canvas.getByRole('button', { name: /Ocultar/i })).toBeVisible();
  },
  render: (args) => ({
    props: {
      ...args,
      tags: ['Taller', 'Urgente'],
      notes: 'Cliente solicita entrega antes del viernes.',
    },
    template: `
      <section class="grid max-w-xl gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-form-field label="Notas del parte" hint="Visible para el equipo de taller" required>
          <josanz-textarea [value]="notes" placeholder="Añade contexto operativo..." (valueChange)="valueChange($event)"></josanz-textarea>
        </josanz-form-field>
        <josanz-form-field label="Unidades" error="Mínimo 1 unidad">
          <josanz-number-input [value]="0" [min]="1" [max]="50" customColor="#635BFF" (valueChange)="valueChange($event)"></josanz-number-input>
        </josanz-form-field>
        <josanz-form-field label="Contraseña de aprobación" hint="Solo para supervisores">
          <josanz-password-input value="demo1234" (valueChange)="valueChange($event)"></josanz-password-input>
        </josanz-form-field>
        <josanz-form-field label="Etiquetas" hint="Pulsa Enter para añadir">
          <josanz-chip-input [values]="tags" (valuesChange)="tagsChange($event)"></josanz-chip-input>
        </josanz-form-field>
      </section>
    `,
  }),
};
