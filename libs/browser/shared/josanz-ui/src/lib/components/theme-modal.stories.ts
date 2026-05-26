import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ThemeModalComponent } from './theme-modal';

const meta: Meta<ThemeModalComponent> = {
  component: ThemeModalComponent,
  title: 'Josanz UI / Theme Modal',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Modal legacy de personalización. Se conserva para compatibilidad; la experiencia preferida es `josanz-app-settings-page`.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    modalClose: sbEmit('modalClose', 'Cierre del modal'),
  },
};

export default meta;
type Story = StoryObj<ThemeModalComponent>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Modal a pantalla completa con panel de tema. Usa Actions para ver `modalClose`.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[820px] overflow-hidden rounded-3xl p-8" style="background: var(--josanz-bg);">
        <section class="mx-auto max-w-5xl rounded-3xl border border-solid p-6 opacity-40" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Dashboard bloqueado por modal legacy</p>
          <h1 class="m-0 mt-1 text-3xl font-black" style="color: var(--josanz-text);">Personalización visual</h1>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div class="rounded-2xl border border-solid p-4" style="border-color: var(--josanz-border);"><strong style="color: var(--josanz-text);">Marca</strong></div>
            <div class="rounded-2xl border border-solid p-4" style="border-color: var(--josanz-border);"><strong style="color: var(--josanz-text);">Atmósfera</strong></div>
            <div class="rounded-2xl border border-solid p-4" style="border-color: var(--josanz-border);"><strong style="color: var(--josanz-text);">Listados</strong></div>
          </div>
        </section>
        <josanz-theme-modal (modalClose)="modalClose($event)"></josanz-theme-modal>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Modal legacy frente a la página de ajustes: conservado para compatibilidad, no para nuevas pantallas.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[640px] rounded-3xl p-8" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          <div class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Legacy</p>
            <h3 class="m-0 mt-2 text-xl font-black" style="color: var(--josanz-text);">Personalización en modal</h3>
            <p class="mt-3 text-sm leading-relaxed" style="color: var(--josanz-text-muted);">
              Úsalo para compatibilidad en flujos antiguos que todavía abren ajustes como overlay.
            </p>
            <div class="mt-5 rounded-2xl border border-dashed p-4" style="border-color: var(--josanz-border); color: var(--josanz-text-muted);">Bloquea el dashboard y concentra el cambio de tema.</div>
          </div>
          <div class="rounded-3xl border border-solid p-6" style="background: color-mix(in srgb, var(--josanz-primary) 7%, var(--josanz-surface)); border-color: var(--josanz-border);">
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-primary);">Recomendado</p>
            <h3 class="m-0 mt-2 text-xl font-black" style="color: var(--josanz-text);">Ajustes como página</h3>
            <p class="mt-3 text-sm leading-relaxed" style="color: var(--josanz-text-muted);">
              Para nuevas pantallas, josanz-app-settings-page ofrece navegación, deep-link por pestaña y más espacio para previews.
            </p>
            <div class="mt-5 grid gap-2">
              <span class="rounded-full px-3 py-2 text-xs font-black" style="background: var(--josanz-surface); color: var(--josanz-text);">/settings?tab=personalizacion</span>
              <span class="rounded-full px-3 py-2 text-xs font-black" style="background: var(--josanz-surface); color: var(--josanz-text);">Sin bloquear navegación lateral</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const OnDarkCanvas: Story = {
  parameters: {
    globals: { theme: 'dark' },
    docs: {
      description: {
        story: 'Comprueba legibilidad del modal sobre fondo oscuro.',
      },
    },
  },
  render: Playground.render,
};

export const InteractiveApply: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Pulsa “Aplicar Cambios” y valida que el modal legacy emite `modalClose`.',
      },
    },
  },
  args: {
    modalClose: fn(),
  },
  render: Playground.render,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /aplicar cambios/i }));
    await expect(args.modalClose).toHaveBeenCalledTimes(1);
  },
};
