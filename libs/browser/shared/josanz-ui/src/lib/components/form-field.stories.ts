import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ChipInputComponent } from './chip-input';
import { FormFieldComponent } from './form-field';
import { NumberInputComponent } from './number-input';
import { PasswordInputComponent } from './password-input';
import { TextareaComponent } from './textarea';

const meta: Meta = {
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
};

export default meta;
type Story = StoryObj;

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
