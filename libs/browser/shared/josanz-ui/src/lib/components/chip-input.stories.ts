import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { ChipInputComponent } from './chip-input';

const meta: Meta<ChipInputComponent> = {
  component: ChipInputComponent,
  title: 'Josanz UI / Chip Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Entrada de etiquetas con chips removibles y ControlValueAccessor para arrays de texto.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta superior' },
    placeholder: { control: 'text', description: 'Placeholder del input' },
    values: { control: 'object', description: 'Chips actuales' },
    disabled: { control: 'boolean', description: 'Bloquea altas y borrados' },
    valuesChange: sbEmit('valuesChange', 'Cambio de chips'),
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<ChipInputComponent>;

export const Playground: Story = {
  args: {
    label: 'Etiquetas de orden',
    placeholder: 'Añadir etiqueta...',
    values: ['Taller', 'Urgente'],
    disabled: false,
    shape: 'rounded',
    valuesChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[460px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-chip-input
          [label]="label"
          [placeholder]="placeholder"
          [values]="values"
          [disabled]="disabled"
          [shape]="shape"
          [customColor]="customColor"
          (valuesChange)="valuesChange($event)"
        ></josanz-chip-input>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Vacío, con chips, deshabilitado y con color personalizado.' },
    },
  },
  render: () => ({
    template: `
      <div class="grid w-[780px] gap-5 md:grid-cols-2">
        <josanz-chip-input label="Servicios" placeholder="Añadir servicio..."></josanz-chip-input>
        <josanz-chip-input label="Etiquetas" [values]="['Garantía', 'Recogida', 'Prioritario']"></josanz-chip-input>
        <josanz-chip-input label="Bloqueado" [values]="['Facturado']" [disabled]="true"></josanz-chip-input>
        <josanz-chip-input label="Campañas" [values]="['Mantenimiento', 'VIP']" shape="pill" customColor="#f97316"></josanz-chip-input>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    label: 'Tags',
    placeholder: 'Añadir tag...',
    values: ['Cliente'],
    valuesChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[440px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-chip-input
          [label]="label"
          [placeholder]="placeholder"
          [values]="values"
          (valuesChange)="valuesChange($event)"
        ></josanz-chip-input>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText(/añadir tag/i), 'Urgente{enter}');
    await expect(args.valuesChange).toHaveBeenCalledWith(['Cliente', 'Urgente']);
    await userEvent.click(canvas.getAllByRole('button', { name: /quitar/i })[0]);
    await expect(args.valuesChange).toHaveBeenCalledWith(['Urgente']);
  },
};
