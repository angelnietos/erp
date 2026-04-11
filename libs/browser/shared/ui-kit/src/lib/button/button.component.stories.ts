import type { Meta, StoryObj } from '@storybook/angular';
import { UiButtonComponent } from './button.component';
import { ArrowRight } from 'lucide-angular';

const meta: Meta<UiButtonComponent> = {
  component: UiButtonComponent,
  title: 'UiButtonComponent',
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['button', 'submit'],
      control: { type: 'select' },
    },
  },
};
export default meta;
type Story = StoryObj<UiButtonComponent>;

export const Primary: Story = {
  args: {
    type: 'button',
    disabled: false,
    loading: false,
    icon: 'arrow-right',
  },
};

export const Loading: Story = {
  args: {
    ...Primary.args,
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Primary.args,
    disabled: true,
  },
};
