import type { Meta, StoryObj } from '@storybook/angular';
import { JosanzUiComponent } from './josanz-ui';
import { expect, within } from '@storybook/test';

const meta: Meta<JosanzUiComponent> = {
  component: JosanzUiComponent,
  title: 'JosanzUiComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<JosanzUiComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  
};
