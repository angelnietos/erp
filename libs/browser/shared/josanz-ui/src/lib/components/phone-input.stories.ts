import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { PhoneInputComponent } from './phone-input';

const meta: Meta<PhoneInputComponent> = {
  component: PhoneInputComponent,
  title: 'Josanz UI / Phone Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Telefono con prefijo internacional y ControlValueAccessor.',
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
    ...sbShapeArgTypes,
    valueChange: sbEmit('valueChange', 'Cambio de telefono'),
  },
};

export default meta;
type Story = StoryObj<PhoneInputComponent>;

export const Playground: Story = {
  args: {
    label: 'Telefono movil',
    placeholder: '600 000 000',
    hint: 'Incluye prefijo internacional',
    shape: 'rounded',
    valueChange: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-3xl gap-5 md:grid-cols-3">
        <josanz-phone-input label="Rounded" hint="Por defecto"></josanz-phone-input>
        <josanz-phone-input label="Pill" shape="pill" placeholder="700 000 000"></josanz-phone-input>
        <josanz-phone-input label="Error" shape="square" error="Numero obligatorio"></josanz-phone-input>
      </div>
    `,
  }),
};

export const InteractiveInput: Story = {
  args: {
    label: 'Telefono contacto',
    valueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), '612 345 678');
    await expect(args.valueChange).toHaveBeenLastCalledWith('+34 612 345 678');
  },
};
