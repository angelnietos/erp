import type { Meta, StoryObj } from '@storybook/angular';
import { MainListLayoutComponent } from './main-list-layout';
import { expect, within } from '@storybook/test';

const meta: Meta<MainListLayoutComponent> = {
  component: MainListLayoutComponent,
  title: 'MainListLayoutComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<MainListLayoutComponent>;

export const Primary: Story = {
  args: {
    title: 'Título',
    primaryBtnLabel: 'Acción',
    filterOptions: ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'],
  },
};

export const Heading: Story = {
  args: {
    title: 'Título',
    primaryBtnLabel: 'Acción',
    filterOptions: ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'],
  },
  
};
