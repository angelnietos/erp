import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DatePickerComponent } from './date-picker';

const meta: Meta<DatePickerComponent> = {
  component: DatePickerComponent,
  title: 'Josanz UI / Date Picker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Selector de fecha nativo con tokens del tema. Complementa calendar y date-time-picker.'),
      },
    },
    layout: 'padded',
  },
  argTypes: { valueChange: sbEmit('valueChange', 'Cambio de fecha') },
};

export default meta;
type Story = StoryObj<DatePickerComponent>;

export const Playground: Story = {
  args: {
    label: 'Fecha de entrega',
    value: '2026-05-23',
    hint: 'Formato según navegador',
    valueChange: fn(),
  },
};
