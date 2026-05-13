import type { Meta, StoryObj } from '@storybook/angular';
import { MainTemplateCardComponent } from './main-template-card';
import { expect, within } from '@storybook/test';

const meta: Meta<MainTemplateCardComponent> = {
  component: MainTemplateCardComponent,
  title: 'MainTemplateCardComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<MainTemplateCardComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  
};
