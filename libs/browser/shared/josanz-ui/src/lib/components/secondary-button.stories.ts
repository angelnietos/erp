import type { Meta, StoryObj } from '@storybook/angular';
import { SecondaryButtonComponent } from './secondary-button';
import { expect, within } from '@storybook/test';

const meta: Meta<SecondaryButtonComponent> = {
  component: SecondaryButtonComponent,
  title: 'SecondaryButtonComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<SecondaryButtonComponent>;

export const Primary: Story = {
  args: {
    label: 'Excel',
  },
};

