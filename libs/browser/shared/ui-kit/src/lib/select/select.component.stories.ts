import { importProvidersFrom } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { sbSelect, sbRadio } from '../../../.storybook/story-arg-types';
import { UiSelectComponent } from './select.component';

/** `selected` es arg de la story (ngModel), no @Input del componente. */
const meta = {
  component: UiSelectComponent,
  title: 'UI Kit / Select',
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(FormsModule)],
    }),
  ],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    id: { control: 'text' },
    selected: { control: { type: 'text' }, description: 'Valor al usar ngModel (WithSelected)' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: sbRadio(['sm', 'md'] as const, 'Tamaño'),
    variant: sbSelect(
      [
        'default', 'filled', 'outlined', 'ghost', 'dark', 'light', 'error', 'success', 'warning',
        'info', 'theme', 'primary', 'secondary', 'transparent', 'minimal', 'rounded', 'glass', 'soft',
      ] as const,
      'Variante',
    ),
  },
} as Meta;

export default meta;
type Story = StoryObj;

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
    template: `<ui-select
      [label]="label"
      [id]="id"
      [placeholder]="placeholder"
      [options]="options"
      [error]="error"
      [disabled]="disabled"
      [size]="size"
      [variant]="variant"
    ></ui-select>`,
  }),
};

export const WithSelected: Story = {
  args: {
    label: 'Selected Option',
    options: sampleOptions,
    selected: '2',
  },
  render: (args) => ({
    props: args,
    template: `<ui-select
      [label]="label"
      [options]="options"
      [(ngModel)]="selected"
    ></ui-select>`,
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
    template: `<ui-select [label]="label" [placeholder]="placeholder" [options]="options" [error]="error" [variant]="variant"></ui-select>`,
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
    template: `<ui-select [label]="label" [placeholder]="placeholder" [options]="options" [size]="size" [variant]="variant"></ui-select>`,
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
