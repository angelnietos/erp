import type { Meta, StoryObj } from '@storybook/angular';
import { PaginationComponent } from './pagination';
import { expect, within } from '@storybook/test';

const meta: Meta<PaginationComponent> = {
  component: PaginationComponent,
  title: 'PaginationComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<PaginationComponent>;

export const PageOne: Story = {
  args: {
    current: 1,
    total: 10,
  },
};

export const MiddlePage: Story = {
  args: {
    current: 5,
    total: 10,
  },
};

export const LastPage: Story = {
  args: {
    current: 10,
    total: 10,
  },
};
