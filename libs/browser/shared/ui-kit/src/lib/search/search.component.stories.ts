import type { Meta, StoryObj } from '@storybook/angular';
import { UiSearchComponent } from './search.component';

const meta: Meta<UiSearchComponent> = {
  component: UiSearchComponent,
  title: 'UiSearchComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiSearchComponent>;

export const Default: Story = {
  args: {
    placeholder: 'Buscar...',
  },
  render: (args) => ({
    props: args,
    template: `<ui-search [placeholder]="placeholder" (searchChange)="onSearch($event)"></ui-search>`,
  }),
};

export const WithValue: Story = {
  args: {
    placeholder: 'Buscar productos',
    value: 'laptop',
  },
  render: (args) => ({
    props: args,
    template: `<ui-search [placeholder]="placeholder" [value]="value" (searchChange)="onSearch($event)"></ui-search>`,
  }),
};

export const FilledVariant: Story = {
  args: {
    placeholder: 'Buscar...',
    variant: 'filled',
  },
  render: (args) => ({
    props: args,
    template: `<ui-search [placeholder]="placeholder" [variant]="variant" (searchChange)="onSearch($event)"></ui-search>`,
  }),
};

export const GlassVariant: Story = {
  args: {
    placeholder: 'Buscar...',
    variant: 'glass',
  },
  render: (args) => ({
    props: args,
    template: `<ui-search [placeholder]="placeholder" [variant]="variant" (searchChange)="onSearch($event)"></ui-search>`,
  }),
};
