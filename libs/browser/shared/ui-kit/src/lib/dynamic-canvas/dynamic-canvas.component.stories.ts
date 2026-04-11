import type { Meta, StoryObj } from '@storybook/angular';
import { DynamicCanvasComponent } from './dynamic-canvas.component';

const meta: Meta<DynamicCanvasComponent> = {
  component: DynamicCanvasComponent,
  title: 'DynamicCanvasComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<DynamicCanvasComponent>;

export const Default: Story = {
  args: {
    htmlRef:
      '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: red; font-size: 24px;">Hello World</div>',
  },
  render: (args) => ({
    props: args,
    template: `<ui-dynamic-canvas [htmlRef]="htmlRef" style="position: relative; width: 400px; height: 200px; border: 1px solid #ccc;"></ui-dynamic-canvas>`,
  }),
};

export const WithAnimation: Story = {
  args: {
    htmlRef:
      '<div style="position: absolute; top: 0; left: 0; width: 50px; height: 50px; background: blue; animation: move 2s infinite;">@keyframes move { 0% { transform: translateX(0); } 50% { transform: translateX(100px); } 100% { transform: translateX(0); } }</div>',
  },
  render: (args) => ({
    props: args,
    template: `<ui-dynamic-canvas [htmlRef]="htmlRef" style="position: relative; width: 200px; height: 100px; border: 1px solid #ccc;"></ui-dynamic-canvas>`,
  }),
};
