import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { CurrencyInputComponent } from './currency-input';

const meta: Meta<CurrencyInputComponent> = {
  component: CurrencyInputComponent,
  title: 'Josanz UI / Currency Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Importe monetario con sufijo de divisa, ControlValueAccessor y formato es-ES al perder foco.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    currency: { control: 'text' },
    ...sbShapeArgTypes,
    valueChange: sbEmit('valueChange', 'Cambio de importe'),
  },
};

export default meta;
type Story = StoryObj<CurrencyInputComponent>;

export const Playground: Story = {
  args: {
    label: 'Presupuesto',
    placeholder: '0,00',
    hint: 'Introduce el importe sin simbolo',
    currency: 'EUR',
    shape: 'rounded',
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-sm">
        <josanz-currency-input
          [label]="label"
          [placeholder]="placeholder"
          [hint]="hint"
          [error]="error"
          [currency]="currency"
          [shape]="shape"
          (valueChange)="valueChange($event)"
        ></josanz-currency-input>
      </div>
    `,
  }),
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-3xl gap-5 md:grid-cols-3">
        <josanz-currency-input label="EUR" currency="EUR" hint="Rounded"></josanz-currency-input>
        <josanz-currency-input label="USD" currency="USD" shape="pill" hint="Pill"></josanz-currency-input>
        <josanz-currency-input label="Error" currency="EUR" error="Importe requerido" shape="square"></josanz-currency-input>
      </div>
    `,
  }),
};

export const InteractiveInput: Story = {
  args: {
    label: 'Importe factura',
    currency: 'EUR',
    valueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), '123,45');
    await expect(args.valueChange).toHaveBeenLastCalledWith(123.45);
  },
};
