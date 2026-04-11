import type { Meta, StoryObj } from '@storybook/angular';
import { UiSelectComponent } from './select.component';

const meta: Meta<UiSelectComponent> = {
  component: UiSelectComponent,
  title: 'UiSelectComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiSelectComponent>;

const sampleOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

export const Default: Story = {
  args: {
    label: 'Choose an option',
    placeholder: 'Select...',
    options: sampleOptions,
  },
  render: (args) => ({
    props: args,
    template: `<ui-select [label]="label" [placeholder]="placeholder" [options]="options"></ui-select>`,
  }),
};

export const WithSelected: Story = {
  args: {
    label: 'Selected Option',
    options: sampleOptions,
  },
  render: (args) => ({
    props: args,
    template: `<ui-select [label]="label" [options]="options" value="2"></ui-select>`,
  }),
};

export const Error: Story = {
  args: {
    label: 'Error Select',
    placeholder: 'Select...',
    options: sampleOptions,
    error: true,
  },
  render: (args) => ({
    props: args,
    template: `<ui-select [label]="label" [placeholder]="placeholder" [options]="options" [error]="error"></ui-select>`,
  }),
};

export const SmallSize: Story = {
  args: {
    label: 'Small Select',
    placeholder: 'Select...',
    options: sampleOptions,
    size: 'sm',
  },
  render: (args) => ({
    props: args,
    template: `<ui-select [label]="label" [placeholder]="placeholder" [options]="options" [size]="size"></ui-select>`,
  }),
};

export const GlassVariant: Story = {
  args: {
    label: 'Glass Select',
    placeholder: 'Select...',
    options: sampleOptions,
    variant: 'glass',
  },
  render: (args) => ({
    props: args,
    template: `<ui-select [label]="label" [placeholder]="placeholder" [options]="options" [variant]="variant"></ui-select>`,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Select',
    placeholder: 'Select...',
    options: sampleOptions,
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<ui-select [label]="label" [placeholder]="placeholder" [options]="options" [disabled]="disabled"></ui-select>`,
  }),
};
