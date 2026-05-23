import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { PhoneInputComponent } from './phone-input';

const meta: Meta<PhoneInputComponent> = {
  component: PhoneInputComponent,
  title: 'Josanz UI / Phone Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Teléfono con prefijo internacional y ControlValueAccessor.'),
      },
    },
    layout: 'padded',
  },
  argTypes: { valueChange: sbEmit('valueChange', 'Cambio de teléfono') },
};

export default meta;
type Story = StoryObj<PhoneInputComponent>;

export const Playground: Story = {
  args: {
    label: 'Teléfono móvil',
    valueChange: fn(),
  },
};
