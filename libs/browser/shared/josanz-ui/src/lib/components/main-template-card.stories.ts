import type { Meta, StoryObj } from '@storybook/angular';
import { MainTemplateCardComponent } from './main-template-card';
import { expect } from 'storybook/test';

const meta: Meta<MainTemplateCardComponent> = {
  component: MainTemplateCardComponent,
  title: 'MainTemplateCardComponent',
};
export default meta;

type Story = StoryObj<MainTemplateCardComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/main-template-card/gi)).toBeTruthy();
  },
};
