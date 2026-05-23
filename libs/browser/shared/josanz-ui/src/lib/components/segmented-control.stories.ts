import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { SegmentedControlComponent, type JosanzSegmentedOption } from './segmented-control';

const options: JosanzSegmentedOption[] = [
  { label: 'Dia', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'AÃ±o', value: 'year', disabled: true },
];

const meta: Meta<SegmentedControlComponent> = {
  component: SegmentedControlComponent,
  title: 'Josanz UI / Segmented Control',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Control segmentado tipo radiogroup para alternar vistas o filtros mutuamente excluyentes.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    options: { control: 'object' },
    value: { control: 'text' },
    ariaLabel: { control: 'text' },
    ...sbShapeArgTypes,
    valueChange: sbEmit('valueChange', 'Cambio de valor'),
    optionSelect: sbEmit('optionSelect', 'Opcion seleccionada'),
  },
};

export default meta;
type Story = StoryObj<SegmentedControlComponent>;

export const Playground: Story = {
  args: {
    label: 'Rango',
    options,
    value: 'week',
    shape: 'pill',
    valueChange: fn(),
    optionSelect: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { options },
    template: `
      <div class="grid gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-segmented-control label="Vista agenda" [options]="options" value="day" shape="rounded"></josanz-segmented-control>
        <josanz-segmented-control label="Periodo facturación" [options]="options" value="month" shape="pill" customColor="#0f766e"></josanz-segmented-control>
        <josanz-segmented-control label="Backoffice compacto" [options]="options" value="week" shape="square"></josanz-segmented-control>
      </div>
    `,
  }),
};

export const InteractiveSelect: Story = {
  args: {
    label: 'Vista',
    options,
    value: 'day',
    valueChange: fn(),
    optionSelect: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-segmented-control
        [label]="label"
        [options]="options"
        [value]="value"
        [shape]="shape"
        [customColor]="customColor"
        (valueChange)="value = $event; valueChange($event)"
        (optionSelect)="optionSelect($event)"
      ></josanz-segmented-control>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: /mes/i }));
    await expect(args.valueChange).toHaveBeenCalledWith('month');
    await expect(canvas.getByRole('radio', { name: /mes/i })).toHaveAttribute('aria-checked', 'true');
  },
};

