import { importProvidersFrom } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { sbSelect } from '../../../.storybook/story-arg-types';
import { UiDatepickerComponent } from './datepicker.component';

/** `dateValue` es arg de la story (ngModel), no @Input del componente. */
const meta = {
  component: UiDatepickerComponent,
  title: 'UI Kit / Datepicker',
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(FormsModule)],
    }),
  ],
  argTypes: {
    variant: sbSelect(
      ['default', 'filled', 'outlined', 'ghost', 'dark', 'light', 'error', 'success', 'warning', 'info'] as const,
      'Variante',
    ),
    label: { control: 'text' },
    minDate: { control: 'text' },
    maxDate: { control: 'text' },
    dateValue: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} as Meta;
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Select Date',
    variant: 'default' as const,
    minDate: '',
    maxDate: '',
  },
  render: (args) => ({
    props: args,
    template: `<ui-datepicker [label]="label" [variant]="variant" [minDate]="minDate" [maxDate]="maxDate"></ui-datepicker>`,
  }),
};

export const WithValue: Story = {
  args: {
    label: 'Birth Date',
    variant: 'default' as const,
    minDate: '',
    maxDate: '',
    dateValue: '1990-01-15',
  },
  render: (args) => ({
    props: args,
    template: `<ui-datepicker [label]="label" [variant]="variant" [minDate]="minDate" [maxDate]="maxDate" [(ngModel)]="dateValue"></ui-datepicker>`,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date',
    disabled: true,
    variant: 'default' as const,
  },
  render: (args) => ({
    props: args,
    template: `<ui-datepicker [label]="label" [disabled]="disabled" [variant]="variant"></ui-datepicker>`,
  }),
};
