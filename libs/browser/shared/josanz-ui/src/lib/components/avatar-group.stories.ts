import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { AvatarGroupComponent, type JosanzAvatarGroupItem } from './avatar-group';

const team: JosanzAvatarGroupItem[] = [
  { name: 'Ana Muñoz', color: '#635BFF' },
  { name: 'Luis Ortega', color: '#0F766E' },
  { name: 'Marta Gil', color: '#B45309' },
  { name: 'Pablo Ruiz', color: '#BE123C' },
  { name: 'Sara Vega', color: '#475569' },
  { name: 'Tomas Alba', color: '#8B5CF6' },
];

const meta: Meta<AvatarGroupComponent> = {
  component: AvatarGroupComponent,
  title: 'Josanz UI / Avatar Group',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Grupo compacto de avatares superpuestos para equipos asignados, participantes o actividad reciente.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    items: { control: 'object' },
    max: { control: 'number' },
    size: { control: 'number' },
    ariaLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<AvatarGroupComponent>;

export const Playground: Story = {
  args: {
    items: team,
    max: 4,
    size: 40,
    ariaLabel: 'Tecnicos asignados',
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { team },
    template: `
      <div class="grid gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <section>
          <p class="m-0 mb-2 text-xs font-black uppercase tracking-widest" style="color: var(--josanz-text-muted);">Compacto</p>
          <josanz-avatar-group [items]="team" [max]="3" [size]="32"></josanz-avatar-group>
        </section>
        <section>
          <p class="m-0 mb-2 text-xs font-black uppercase tracking-widest" style="color: var(--josanz-text-muted);">Equipo completo</p>
          <josanz-avatar-group [items]="team" [max]="6" [size]="44"></josanz-avatar-group>
        </section>
      </div>
    `,
  }),
};

export const AccessibilityCheck: Story = {
  args: {
    items: team,
    max: 4,
    ariaLabel: 'Equipo de taller',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/equipo de taller/i)).toBeInTheDocument();
    await expect(canvas.getByText('+2')).toBeInTheDocument();
  },
};
