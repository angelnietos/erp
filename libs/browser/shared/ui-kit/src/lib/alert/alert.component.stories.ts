import type { Meta, StoryObj } from '@storybook/angular';
import { UiAlertComponent } from './alert.component';

const meta: Meta<UiAlertComponent> = {
  component: UiAlertComponent,
  title: 'UiAlertComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiAlertComponent>;

export const Error: Story = {
  args: {
    type: 'error',
  },
  render: (args) => ({
    props: args,
    template: `<ui-alert [type]="type">Este es un mensaje de error.</ui-alert>`,
  }),
};

export const Success: Story = {
  args: {
    type: 'success',
  },
  render: (args) => ({
    props: args,
    template: `<ui-alert [type]="type">Acción completada con éxito.</ui-alert>`,
  }),
};
