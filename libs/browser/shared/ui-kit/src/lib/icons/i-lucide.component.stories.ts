import type { Meta, StoryObj } from '@storybook/angular';
import { ILucideComponent } from './i-lucide.component';

const meta: Meta<ILucideComponent> = {
  component: ILucideComponent,
  title: 'ILucideComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<ILucideComponent>;

export const Home: Story = {
  args: {
    name: 'home',
  },
  render: (args) => ({
    props: args,
    template: `<i-lucide [name]="name"></i-lucide> Home Icon`,
  }),
};

export const User: Story = {
  args: {
    name: 'user',
  },
  render: (args) => ({
    props: args,
    template: `<i-lucide [name]="name"></i-lucide> User Icon`,
  }),
};

export const Settings: Story = {
  args: {
    name: 'settings',
  },
  render: (args) => ({
    props: args,
    template: `<i-lucide [name]="name"></i-lucide> Settings Icon`,
  }),
};
