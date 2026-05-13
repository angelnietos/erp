import type { Meta, StoryObj } from '@storybook/angular';
import { DetailCardComponent } from './detail-card';
import { expect, within } from '@storybook/test';

const meta: Meta<DetailCardComponent> = {
  component: DetailCardComponent,
  title: 'DetailCardComponent',
  tags: ['autodocs'],
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

