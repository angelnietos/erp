import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { ColorPickerComponent } from './color-picker';

const presets = ['#635BFF', '#0F766E', '#B45309', '#BE123C', '#0F1E2F'];

const meta: Meta<ColorPickerComponent> = {
  component: ColorPickerComponent,
  title: 'Josanz UI / Color Picker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Selector de color con campo textual y presets para personalizacion de marca o estados.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'color' },
    presets: { control: 'object' },
    ariaLabel: { control: 'text' },
    valueChange: sbEmit('valueChange', 'Cambio de color'),
  },
};

export default meta;
type Story = StoryObj<ColorPickerComponent>;

export const Playground: Story = {
  args: {
    label: 'Color de marca',
    value: '#635BFF',
    presets,
    valueChange: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { presets },
    template: `
      <div class="grid max-w-xl gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-color-picker label="Marca principal" value="#635BFF" [presets]="presets"></josanz-color-picker>
        <josanz-color-picker label="Sin presets" value="#0F766E" [presets]="[]"></josanz-color-picker>
      </div>
    `,
  }),
};

export const InteractivePreset: Story = {
  args: {
    label: 'Accent',
    value: '#635BFF',
    presets,
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-color-picker
        [label]="label"
        [value]="value"
        [presets]="presets"
        (valueChange)="value = $event; valueChange($event)"
      ></josanz-color-picker>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /color #0f766e/i }));
    await expect(args.valueChange).toHaveBeenCalledWith('#0F766E');
    await expect(canvas.getByDisplayValue('#0F766E')).toBeInTheDocument();
  },
};
