import type { Meta, StoryObj } from '@storybook/angular';
import { PaginationComponent } from './pagination';
import { expect, within } from '@storybook/test';

const meta: Meta<PaginationComponent> = {
  component: PaginationComponent,
  title: 'PaginationComponent',
};
export default meta;

type Story = StoryObj<PaginationComponent>;

export const Primary: Story = {
  args: {
    current: 0,
    total: 0,
  },
};

export const Heading: Story = {
  args: {
    current: 0,
    total: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/pagination/gi)).toBeTruthy();
  },
};
