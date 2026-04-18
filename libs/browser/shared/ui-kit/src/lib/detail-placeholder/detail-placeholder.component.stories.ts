import type { Meta, StoryObj } from '@storybook/angular';
import { DetailPlaceholderComponent } from './detail-placeholder.component';

const meta: Meta<DetailPlaceholderComponent> = {
  component: DetailPlaceholderComponent,
  title: 'DetailPlaceholderComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<DetailPlaceholderComponent>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `<ui-detail-placeholder></ui-detail-placeholder>`,
  }),
};
