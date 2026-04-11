import type { Meta, StoryObj } from '@storybook/angular';
import { UiTextareaComponent } from './textarea.component';

const meta: Meta<UiTextareaComponent> = {
  component: UiTextareaComponent,
  title: 'UiTextareaComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiTextareaComponent>;

export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter your description',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder"></ui-textarea>`,
  }),
};

export const WithHint: Story = {
  args: {
    label: 'Message',
    placeholder: 'Type your message',
    hint: 'Maximum 500 characters',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [hint]="hint"></ui-textarea>`,
  }),
};

export const Error: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Enter feedback',
    error: true,
    hint: 'This field is required',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [error]="error" [hint]="hint"></ui-textarea>`,
  }),
};

export const GlassVariant: Story = {
  args: {
    label: 'Comment',
    placeholder: 'Add a comment',
    variant: 'glass',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [variant]="variant"></ui-textarea>`,
  }),
};

export const MinimalVariant: Story = {
  args: {
    label: 'Note',
    placeholder: 'Quick note',
    variant: 'minimal',
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [variant]="variant"></ui-textarea>`,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'Cannot edit',
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea [label]="label" [placeholder]="placeholder" [disabled]="disabled"></ui-textarea>`,
  }),
};
