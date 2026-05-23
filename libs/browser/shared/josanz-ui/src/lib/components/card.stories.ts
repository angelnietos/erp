import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { CardComponent } from './card';

const meta: Meta<CardComponent> = {
  component: CardComponent,
  title: 'Josanz UI / Card',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Tarjeta generica con cabecera, cuerpo proyectable y pie opcional. Complementa stat-card y grid-list-card para bloques de contenido libre.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    eyebrow: { control: 'text' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    footerLabel: { control: 'text' },
    headerActionLabel: { control: 'text' },
    elevated: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    ...sbShapeArgTypes,
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
    shape: 'rounded',
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
          [shape]="shape"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
        >
          <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">
            Contenido libre: graficos, tablas compactas, formularios cortos o listas.
          </p>
        </josanz-card>
      </div>
    `,
  }),
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-5xl gap-6 md:grid-cols-3" style="background: var(--josanz-bg);">
        <josanz-card eyebrow="Elevada" title="Con sombra" subtitle="Estado por defecto" footerLabel="Footer">
          <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">Ideal para paneles principales.</p>
        </josanz-card>
        <josanz-card eyebrow="Plano" title="Sin elevacion" subtitle="Bloque secundario" [elevated]="false" shape="pill">
          <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">Agrupa contenido sin competir visualmente.</p>
        </josanz-card>
        <josanz-card eyebrow="Accion" title="Con boton" headerActionLabel="Abrir" customColor="#0f766e" shape="square">
          <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">Cabecera con accion contextual.</p>
        </josanz-card>
      </div>
    `,
  }),
};

export const AccessibilityCheck: Story = {
  args: {
    title: 'Card accesible',
    subtitle: 'Con aria-label implicita',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/card accesible/i)).toBeInTheDocument();
  },
};
