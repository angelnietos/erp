import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { NumberInputComponent } from './number-input';

const meta: Meta<NumberInputComponent> = {
  component: NumberInputComponent,
  title: 'Josanz UI / Number Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Contador numerico con steppers y ControlValueAccessor para formularios reactivos.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    hint: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    ...sbShapeArgTypes,
    valueChange: sbEmit('valueChange', 'Cambio de valor'),
  },
};

export default meta;
type Story = StoryObj<NumberInputComponent>;

export const Playground: Story = {
  args: {
    label: 'Unidades',
    value: 12,
    min: 0,
    max: 99,
    step: 1,
    hint: 'Stock disponible en almacen',
    shape: 'rounded',
    valueChange: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-5 md:grid-cols-4">
        <josanz-number-input label="Unidades reservadas" [value]="12" hint="Pedido NovaByte"></josanz-number-input>
        <josanz-number-input label="Técnicos asignados" [value]="4" shape="pill" customColor="#0f766e"></josanz-number-input>
        <josanz-number-input label="Stock mínimo" [value]="20" shape="square"></josanz-number-input>
        <josanz-number-input label="Error" [value]="150" [max]="100" error="Supera el maximo"></josanz-number-input>
      </div>
    `,
  }),
};

export const WithError: Story = {
  args: {
    label: 'Cantidad',
    value: 150,
    min: 1,
    max: 100,
    error: 'Supera el maximo permitido.',
    valueChange: fn(),
  },
};

export const InteractiveStepper: Story = {
  args: {
    label: 'Unidades',
    value: 2,
    min: 0,
    max: 10,
    step: 2,
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-number-input
        [label]="label"
        [value]="value"
        [min]="min"
        [max]="max"
        [step]="step"
        (valueChange)="value = $event; valueChange($event)"
      ></josanz-number-input>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '+' }));
    await expect(args.valueChange).toHaveBeenCalledWith(4);
    await expect(canvas.getByRole('spinbutton')).toHaveValue(4);
  },
};

