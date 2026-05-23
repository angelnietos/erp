import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbRadio } from '../../../.storybook/story-arg-types';
import { DividerComponent } from './divider';

const meta: Meta<DividerComponent> = {
  component: DividerComponent,
  title: 'Josanz UI / Divider',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Separador horizontal u orientacion vertical con etiqueta opcional.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    orientation: sbRadio(['horizontal', 'vertical'] as const, 'Orientacion'),
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<DividerComponent>;

export const Playground: Story = {
  args: {
    label: 'o',
    orientation: 'horizontal',
    color: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="grid max-w-md gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <p class="m-0 text-sm" style="color: var(--josanz-text);">Seccion A</p>
        <josanz-divider [label]="label" [orientation]="orientation" [color]="color"></josanz-divider>
        <p class="m-0 text-sm" style="color: var(--josanz-text);">Seccion B</p>
      </section>
    `,
  }),
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <section class="grid max-w-lg gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-divider></josanz-divider>
        <josanz-divider label="acciones"></josanz-divider>
        <josanz-divider label="alerta" color="var(--josanz-danger)"></josanz-divider>
        <div class="flex h-24 items-stretch gap-4">
          <span class="text-sm" style="color: var(--josanz-text-muted);">Izquierda</span>
          <josanz-divider orientation="vertical"></josanz-divider>
          <span class="text-sm" style="color: var(--josanz-text-muted);">Derecha</span>
        </div>
      </section>
    `,
  }),
};

export const AccessibilityCheck: Story = {
  args: {
    label: 'contenido relacionado',
    orientation: 'horizontal',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(canvas.getByText(/contenido relacionado/i)).toBeInTheDocument();
  },
};
