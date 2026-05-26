import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { SelectComponent } from './select';

const branchOptions = [
  { label: 'Madrid central', value: 'mad' },
  { label: 'Barcelona', value: 'bcn' },
  { label: 'Valencia', value: 'vlc' },
  { label: 'Delegación cerrada', value: 'closed', disabled: true },
];

const meta: Meta<SelectComponent> = {
  component: SelectComponent,
  title: 'Josanz UI / Select',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Select nativo estilizado con placeholder, hint, error y ControlValueAccessor para formularios reactivos.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta superior' },
    placeholder: { control: 'text', description: 'Opción placeholder' },
    options: { control: 'object', description: 'Opciones del select' },
    value: { control: 'text', description: 'Valor seleccionado' },
    hint: { control: 'text', description: 'Ayuda bajo el campo' },
    error: { control: 'text', description: 'Mensaje de error' },
    required: { control: 'boolean', description: 'Bloquea el placeholder vacío' },
    disabled: { control: 'boolean', description: 'Estado deshabilitado' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    valueChange: sbEmit('valueChange', 'Cambio de opción'),
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Playground: Story = {
  args: {
    label: 'Delegación',
    placeholder: 'Elegir delegación...',
    options: branchOptions,
    value: 'mad',
    hint: 'La delegación define impuestos y numeración.',
    required: true,
    shape: 'rounded',
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[380px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-select
          [label]="label"
          [placeholder]="placeholder"
          [options]="options"
          [value]="value"
          [hint]="hint"
          [error]="error"
          [required]="required"
          [disabled]="disabled"
          [shape]="shape"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
          (valueChange)="valueChange($event)"
        ></josanz-select>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Placeholder requerido, selección válida, error y variante pill con color propio.' },
    },
  },
  render: () => ({
    props: { branchOptions },
    template: `
      <div class="grid w-[760px] gap-5 md:grid-cols-2">
        <josanz-select label="Delegación requerida" placeholder="Elegir..." [options]="branchOptions" [required]="true" hint="No permite guardar vacío."></josanz-select>
        <josanz-select label="Delegación actual" [options]="branchOptions" value="bcn" hint="Barcelona seleccionada."></josanz-select>
        <josanz-select label="Delegación" placeholder="Elegir..." [options]="branchOptions" error="Selecciona una delegación para continuar."></josanz-select>
        <josanz-select label="Zona logística" [options]="branchOptions" value="vlc" shape="pill" customColor="#10b981"></josanz-select>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    label: 'Sede',
    placeholder: 'Selecciona sede...',
    options: branchOptions,
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[360px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-select
          [label]="label"
          [placeholder]="placeholder"
          [options]="options"
          (valueChange)="valueChange($event)"
        ></josanz-select>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: /sede/i }), 'bcn');
    await expect(args.valueChange).toHaveBeenCalledWith('bcn');
  },
};
