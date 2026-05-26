import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { TextareaComponent } from './textarea';

const meta: Meta<TextareaComponent> = {
  component: TextareaComponent,
  title: 'Josanz UI / Textarea',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Área de texto con etiqueta, hint, error, contador opcional y ControlValueAccessor. Respeta `shape`, `customColor` y los tokens CSS del tema.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta superior' },
    placeholder: { control: 'text', description: 'Texto de ayuda dentro del campo' },
    value: { control: 'text', description: 'Valor actual' },
    rows: { control: { type: 'number', min: 2, max: 10 }, description: 'Filas visibles' },
    maxLength: { control: { type: 'number', min: 20, max: 500 }, description: 'Límite de caracteres' },
    hint: { control: 'text', description: 'Ayuda bajo el campo' },
    error: { control: 'text', description: 'Mensaje de error' },
    valueChange: sbEmit('valueChange', 'Cambio de texto'),
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<TextareaComponent>;

export const Playground: Story = {
  args: {
    label: 'Notas internas',
    placeholder: 'Describe el trabajo realizado...',
    value: 'Cliente solicita revisión completa antes de facturar.',
    rows: 4,
    maxLength: 180,
    hint: 'Visible solo para el equipo de taller.',
    shape: 'rounded',
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[420px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-textarea
          [label]="label"
          [placeholder]="placeholder"
          [value]="value"
          [rows]="rows"
          [maxLength]="maxLength"
          [hint]="hint"
          [error]="error"
          [shape]="shape"
          [customColor]="customColor"
          (valueChange)="valueChange($event)"
        ></josanz-textarea>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Estados habituales: vacío con hint, valor largo con contador, error y color personalizado.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid w-[760px] gap-5 md:grid-cols-2">
        <josanz-textarea label="Diagnóstico" placeholder="Pendiente de revisar..." hint="Añade síntomas, pruebas y observaciones."></josanz-textarea>
        <josanz-textarea label="Resumen" value="Se sustituye batería y se comprueba alternador." [maxLength]="120" hint="Incluye el trabajo visible en factura."></josanz-textarea>
        <josanz-textarea label="Incidencia" value="Falta autorización del cliente." error="Requiere aprobación antes de continuar."></josanz-textarea>
        <josanz-textarea label="Nota comercial" shape="pill" customColor="#8b5cf6" value="Aplicar descuento por campaña de mantenimiento."></josanz-textarea>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    label: 'Observaciones',
    placeholder: 'Escribe una observación...',
    rows: 3,
    maxLength: 80,
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[380px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-textarea
          [label]="label"
          [placeholder]="placeholder"
          [rows]="rows"
          [maxLength]="maxLength"
          (valueChange)="valueChange($event)"
        ></josanz-textarea>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: /observaciones/i }), 'Llamar antes de entregar');
    await expect(args.valueChange).toHaveBeenCalled();
    await expect(canvas.getByText(/24\/80/i)).toBeVisible();
  },
};
