import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { RatingComponent } from './rating';

const meta: Meta<RatingComponent> = {
  component: RatingComponent,
  title: 'Josanz UI / Rating',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Selector de valoracion con estrellas para satisfaccion, prioridad o scoring simple.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'number' },
    max: { control: 'number' },
    readonly: { control: 'boolean' },
    showValue: { control: 'boolean' },
    customColor: { control: 'color' },
    ariaLabel: { control: 'text' },
    valueChange: sbEmit('valueChange', 'Cambio de valoracion'),
  },
};

export default meta;
type Story = StoryObj<RatingComponent>;

export const Playground: Story = {
  args: {
    label: 'Satisfaccion',
    value: 4,
    max: 5,
    showValue: true,
    readonly: false,
    valueChange: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-rating label="Cliente" [value]="5"></josanz-rating>
        <josanz-rating label="Prioridad" [value]="3" customColor="var(--josanz-danger)"></josanz-rating>
        <josanz-rating label="Solo lectura" [value]="4" [readonly]="true"></josanz-rating>
        <josanz-rating label="Escala 10" [value]="7" [max]="10" customColor="#8b5cf6"></josanz-rating>
      </div>
    `,
  }),
};

export const InteractiveRate: Story = {
  args: {
    label: 'Valora el servicio',
    value: 2,
    max: 5,
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-rating
        [label]="label"
        [value]="value"
        [max]="max"
        [readonly]="readonly"
        [showValue]="showValue"
        [customColor]="customColor"
        (valueChange)="value = $event; valueChange($event)"
      ></josanz-rating>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: /valorar 5/i }));
    await expect(args.valueChange).toHaveBeenCalledWith(5);
    await expect(canvas.getByText('5/5')).toBeInTheDocument();
  },
};
