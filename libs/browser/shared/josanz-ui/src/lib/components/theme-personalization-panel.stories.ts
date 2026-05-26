import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ButtonComponent } from './button';
import { GridListCardComponent } from './grid-list-card';
import { PaginationComponent } from './pagination';
import { StatCardComponent } from './stat-card';
import { ThemePersonalizationPanelComponent } from './theme-personalization-panel';

const meta: Meta<ThemePersonalizationPanelComponent> = {
  component: ThemePersonalizationPanelComponent,
  title: 'Josanz UI / Theme Personalization Panel',
  decorators: [
    moduleMetadata({
      imports: [
        ButtonComponent,
        GridListCardComponent,
        PaginationComponent,
        StatCardComponent,
        ThemePersonalizationPanelComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Panel de personalización que modifica `JosanzThemeService`: color de marca, atmósfera, columnas de listado y variante de paginación. Referencia funcional para validar todos los tokens.',
        ),
      },
    },
    layout: 'fullscreen',
    controls: { disable: true },
  },
  argTypes: {
    // ThemePersonalizationPanel no expone @Input/@Output: opera directamente sobre JosanzThemeService.
  },
};

export default meta;
type Story = StoryObj<ThemePersonalizationPanelComponent>;

const panelShell = `
  <div class="min-h-[760px] p-6" style="background: var(--josanz-bg);">
    <div class="mx-auto max-w-6xl rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
      <josanz-theme-personalization-panel></josanz-theme-personalization-panel>
    </div>
  </div>
`;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactúa con los controles del panel y observa cómo cambian Marca, Shape y listados en otras stories abiertas.',
      },
    },
  },
  render: () => ({ template: panelShell }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Panel con tarjetas de preview que muestran cómo afectan color de marca, atmósfera y paginación al resto del sistema.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="min-h-[760px] p-6" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <josanz-theme-personalization-panel></josanz-theme-personalization-panel>
          </div>
          <div class="space-y-4">
            <div class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Preview acciones</p>
              <div class="mt-4 flex gap-3">
                <josanz-button label="Guardar ajustes" [showIcon]="false"></josanz-button>
                <josanz-button label="Vista previa" variant="outline" [showIcon]="false"></josanz-button>
              </div>
            </div>
            <div class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Preview dashboard</p>
              <div class="mt-4 grid gap-3">
                <josanz-stat-card title="Órdenes activas" value="36" caption="3 urgentes" tone="primary" icon="trend"></josanz-stat-card>
                <josanz-grid-list-card title="Gala Primavera" status="Confirmado" statusVariant="confirmado" density="compact" [fieldLabels]="['Cliente', 'Ciudad']" [previewLines]="['NovaByte', 'Madrid']"></josanz-grid-list-card>
                <div class="flex justify-end"><josanz-pagination [current]="2" [total]="6" variant="numbered"></josanz-pagination></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const CompactPreview: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Vista más estrecha para validar responsive del panel.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="min-h-[640px] p-4" style="background: var(--josanz-bg);">
        <div class="mx-auto max-w-md rounded-2xl border border-solid p-4" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-theme-personalization-panel></josanz-theme-personalization-panel>
        </div>
      </div>
    `,
  }),
};
