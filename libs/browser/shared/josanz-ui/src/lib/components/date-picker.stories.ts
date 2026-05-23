import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { DatePickerComponent } from './date-picker';

const meta: Meta<DatePickerComponent> = {
  component: DatePickerComponent,
  title: 'Josanz UI / Date Picker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Selector de fecha nativo con tokens del tema. Complementa calendar y date-time-picker.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'date' },
    min: { control: 'text' },
    max: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    ariaLabel: { control: 'text' },
    ...sbShapeArgTypes,
    valueChange: sbEmit('valueChange', 'Cambio de fecha'),
  },
};

export default meta;
type Story = StoryObj<DatePickerComponent>;

export const Playground: Story = {
  args: {
    label: 'Fecha de entrega',
    value: '2026-05-23',
    min: '2026-01-01',
    max: '2026-12-31',
    hint: 'Formato segun navegador',
    shape: 'rounded',
    valueChange: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-3xl gap-5 md:grid-cols-3">
        <josanz-date-picker label="Entrega" value="2026-05-23" hint="Rounded"></josanz-date-picker>
        <josanz-date-picker label="Cita" value="2026-06-02" shape="pill" customColor="#0f766e"></josanz-date-picker>
        <josanz-date-picker label="Vencimiento" error="Fecha fuera de rango" value="2026-01-01" shape="square"></josanz-date-picker>
      </div>
    `,
  }),
};

export const InteractiveChange: Story = {
  args: {
    label: 'Fecha de cita',
    value: '2026-05-23',
    valueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/fecha de cita/i);
    await userEvent.clear(input);
    await userEvent.type(input, '2026-06-15');
    await expect(args.valueChange).toHaveBeenLastCalledWith('2026-06-15');
  },
};
