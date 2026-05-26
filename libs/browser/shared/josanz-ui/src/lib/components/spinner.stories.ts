import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { SpinnerComponent } from './spinner';

const meta: Meta<SpinnerComponent> = {
  component: SpinnerComponent,
  title: 'Josanz UI / Spinner',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SpinnerComponent] })],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Indicador de carga circular para acciones asíncronas.'),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Texto visible junto al spinner' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del indicador',
    },
    customColor: { control: 'color', description: 'Color opcional del indicador' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible para lectores de pantalla' },
    srText: { control: 'text', description: 'Texto solo para lector de pantalla' },
  },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Playground: Story = {
  args: { label: 'Sincronizando datos...', size: 'md' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="grid gap-5 p-8" style="background: var(--josanz-bg);">
        <josanz-spinner size="sm" label="Exportando CSV..."></josanz-spinner>
        <josanz-spinner size="md" label="Sincronizando órdenes..."></josanz-spinner>
        <josanz-spinner size="lg" label="Cargando panel de taller..."></josanz-spinner>
      </div>
    `,
  }),
};

export const InButtonAndTableContext: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <section class="grid max-w-3xl gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Guardado automático</p>
            <h2 class="m-0 mt-1 text-xl font-black" style="color: var(--josanz-text);">Orden #1042</h2>
          </div>
          <button type="button" class="inline-flex items-center gap-2 rounded-full border-0 px-4 py-2 text-sm font-black text-white" style="background: var(--josanz-primary);">
            <josanz-spinner size="sm" ariaLabel="Guardando orden"></josanz-spinner>
            Guardando
          </button>
        </div>
        <div class="rounded-2xl border border-solid p-4" style="border-color: var(--josanz-border);">
          <josanz-spinner label="Actualizando líneas de presupuesto..." ariaLabel="Actualizando líneas"></josanz-spinner>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status', { name: /Guardando orden/i })).toBeVisible();
    await expect(canvas.getByRole('status', { name: /Actualizando líneas/i })).toBeVisible();
  },
};
