import type { Meta, StoryObj } from '@storybook/angular';
import { MainTemplateCardComponent } from './main-template-card';
import { expect, within } from '@storybook/test';

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/main-template-card/gi)).toBeTruthy();
  },
};
