import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { CardComponent } from './card';

const meta: Meta<CardComponent> = {
  component: CardComponent,
  title: 'Josanz UI / Card',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Tarjeta genérica con cabecera, cuerpo proyectable y pie opcional. Complementa stat-card y grid-list-card para bloques de contenido libre.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Playground: Story = {
  args: {
    eyebrow: 'Operaciones',
    title: 'Resumen semanal',
    subtitle: 'KPIs consolidados del taller',
    footerLabel: 'Actualizado hace 5 min',
    headerActionLabel: 'Ver detalle',
    elevated: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-xl p-6" style="background: var(--josanz-bg);">
        <josanz-card
          [eyebrow]="eyebrow"
          [title]="title"
          [subtitle]="subtitle"
          [footerLabel]="footerLabel"
          [headerActionLabel]="headerActionLabel"
          [elevated]="elevated"
        >
          <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">
            Contenido libre: gráficos, tablas compactas, formularios cortos o listas.
          </p>
        </josanz-card>
      </div>
    `,
  }),
};
