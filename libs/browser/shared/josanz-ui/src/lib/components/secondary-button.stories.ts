import type { Meta, StoryObj } from '@storybook/angular';
import { SecondaryButtonComponent } from './secondary-button';
import { expect, within } from '@storybook/test';

const meta: Meta<SecondaryButtonComponent> = {
  component: SecondaryButtonComponent,
  title: 'SecondaryButtonComponent',
};
export default meta;

type Story = StoryObj<SecondaryButtonComponent>;

export const Primary: Story = {
  args: {
    label: 'Excel',
  },
};

export const Heading: Story = {
  args: {
    label: 'Excel',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/secondary-button/gi)).toBeTruthy();
  },
};
