import type { Meta, StoryObj } from '@storybook/angular';
import { sbSelect } from '../../../.storybook/story-arg-types';
import { UiDatepickerComponent } from './datepicker.component';

const meta: Meta<UiDatepickerComponent> = {
  component: UiDatepickerComponent,
  title: 'UiDatepickerComponent',
  tags: ['autodocs'],
  argTypes: {
    variant: sbSelect(
      ['default', 'filled', 'outlined', 'ghost', 'dark', 'light', 'error', 'success', 'warning', 'info'] as const,
      'Variante',
    ),
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<UiDatepickerComponent>;

export const Default: Story = {
  args: {
    label: 'Select Date',
  },
  render: (args) => ({
    props: args,
    template: `<ui-datepicker [label]="label"></ui-datepicker>`,
  }),
};

export const WithValue: Story = {
  args: {
    label: 'Birth Date',
    value: '1990-01-01',
  },
  render: (args) => ({
    props: args,
    template: `<ui-datepicker [label]="label" [value]="value"></ui-datepicker>`,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date',
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<ui-datepicker [label]="label" [disabled]="disabled"></ui-datepicker>`,
  }),
};
