import type { Meta, StoryObj } from '@storybook/angular';
import { DetailCardComponent } from './detail-card';
import { expect, within } from '@storybook/test';

const meta: Meta<DetailCardComponent> = {
  component: DetailCardComponent,
  title: 'DetailCardComponent',
};
export default meta;

type Story = StoryObj<DetailCardComponent>;

export const Primary: Story = {
  args: {
    imageUrl: '',
    title: '',
    badgeText: '',
    subtitle: '',
    description: '',
    tags: [],
  },
};

export const Heading: Story = {
  args: {
    imageUrl: '',
    title: '',
    badgeText: '',
    subtitle: '',
    description: '',
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/detail-card/gi)).toBeTruthy();
  },
};
