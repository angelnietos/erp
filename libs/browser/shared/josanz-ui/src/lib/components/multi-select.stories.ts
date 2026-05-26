import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { MultiSelectComponent } from './multi-select';

const serviceOptions = [
  { label: 'Cambio de aceite', value: 'oil' },
  { label: 'Revisión frenos', value: 'brakes' },
  { label: 'Alineación', value: 'alignment' },
  { label: 'ITV precheck', value: 'itv' },
  { label: 'Servicio no disponible', value: 'disabled', disabled: true },
];

const meta: Meta<MultiSelectComponent> = {
  component: MultiSelectComponent,
  title: 'Josanz UI / Multi Select',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Selector múltiple con panel desplegable, badges removibles y ControlValueAccessor para arrays de valores.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta superior' },
    placeholder: { control: 'text', description: 'Texto cuando no hay selección' },
    options: { control: 'object', description: 'Opciones disponibles' },
    values: { control: 'object', description: 'Valores seleccionados' },
    disabled: { control: 'boolean', description: 'Bloquea el desplegable' },
    customColor: { control: 'color', description: 'Color de badges y foco' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    valuesChange: sbEmit('valuesChange', 'Cambio de selección múltiple'),
  },
};

export default meta;
type Story = StoryObj<MultiSelectComponent>;

export const Playground: Story = {
  args: {
    label: 'Servicios incluidos',
    placeholder: 'Seleccionar servicios...',
    options: serviceOptions,
    values: ['oil', 'brakes'],
    disabled: false,
    valuesChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[440px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-multi-select
          [label]="label"
          [placeholder]="placeholder"
          [options]="options"
          [values]="values"
          [disabled]="disabled"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
          (valuesChange)="valuesChange($event)"
        ></josanz-multi-select>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Vacío, con selección, deshabilitado y con color personalizado.' },
    },
  },
  render: () => ({
    props: { serviceOptions },
    template: `
      <div class="grid w-[820px] gap-5 md:grid-cols-2">
        <josanz-multi-select label="Servicios" placeholder="Seleccionar..." [options]="serviceOptions"></josanz-multi-select>
        <josanz-multi-select label="Incluidos" [options]="serviceOptions" [values]="['oil', 'alignment']"></josanz-multi-select>
        <josanz-multi-select label="Bloqueado" [options]="serviceOptions" [values]="['brakes']" [disabled]="true"></josanz-multi-select>
        <josanz-multi-select label="Campaña activa" [options]="serviceOptions" [values]="['itv']" customColor="#10b981"></josanz-multi-select>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    label: 'Trabajos',
    placeholder: 'Seleccionar trabajos...',
    options: serviceOptions,
    values: ['oil'],
    valuesChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[440px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-multi-select
          [label]="label"
          [placeholder]="placeholder"
          [options]="options"
          [values]="values"
          (valuesChange)="valuesChange($event)"
        ></josanz-multi-select>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /cambio de aceite/i }));
    await userEvent.click(canvas.getByRole('checkbox', { name: /revisión frenos/i }));
    await expect(args.valuesChange).toHaveBeenCalledWith(['oil', 'brakes']);
  },
};
