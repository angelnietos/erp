import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { NumberInputComponent } from './number-input';

const meta: Meta<NumberInputComponent> = {
  component: NumberInputComponent,
  title: 'Josanz UI / Number Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Contador numérico con steppers y ControlValueAccessor para formularios reactivos.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: { valueChange: sbEmit('valueChange', 'Cambio de valor') },
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
    hint: 'Stock disponible en almacén',
    valueChange: fn(),
  },
};

export const WithError: Story = {
  args: {
    label: 'Cantidad',
    value: 150,
    min: 1,
    max: 100,
    error: 'Supera el máximo permitido.',
    valueChange: fn(),
  },
};
