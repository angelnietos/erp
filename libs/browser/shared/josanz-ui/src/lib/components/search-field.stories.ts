import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { SearchFieldComponent } from './search-field';

const meta: Meta<SearchFieldComponent> = {
  component: SearchFieldComponent,
  title: 'Josanz UI / Search Field',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Campo de búsqueda genérico con icono y limpiar. Diferente de list-search-field (listados).'),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    valueChange: sbEmit('valueChange', 'Cambio de texto'),
    search: sbEmit('search', 'Búsqueda'),
  },
};

export default meta;
type Story = StoryObj<SearchFieldComponent>;

export const Playground: Story = {
  args: {
    placeholder: 'Buscar órdenes, clientes...',
    value: '',
    clearable: true,
    valueChange: fn(),
    search: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox'), 'taller');
    await expect(args['search']).toHaveBeenCalled();
  },
};

export const ClientListToolbar: Story = {
  args: {
    placeholder: 'Buscar cliente, NIF o contacto...',
    value: '',
    clearable: true,
    shape: 'pill',
    valueChange: fn(),
    search: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="grid max-w-3xl gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Clientes</p>
            <h2 class="m-0 mt-1 text-xl font-black" style="color: var(--josanz-text);">Búsqueda rápida</h2>
          </div>
          <div class="min-w-[280px] flex-1">
            <josanz-search-field
              [placeholder]="placeholder"
              [value]="value"
              [clearable]="clearable"
              [shape]="shape"
              (valueChange)="valueChange($event)"
              (search)="search($event)"
            ></josanz-search-field>
          </div>
        </div>
        <div class="grid gap-2">
          <div class="rounded-2xl border border-solid p-4" style="border-color: var(--josanz-border); color: var(--josanz-text);">NovaByte S.L. · B-12345678 · contacto@novabyte.es</div>
          <div class="rounded-2xl border border-solid p-4" style="border-color: var(--josanz-border); color: var(--josanz-text);">Eventos del Sur · Sevilla · ops@eventosur.es</div>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox'), 'Nova');
    await expect(args['search']).toHaveBeenLastCalledWith('Nova');
    await userEvent.click(canvas.getByRole('button', { name: '×' }));
    await expect(args['search']).toHaveBeenLastCalledWith('');
  },
};

export const EmptyResultsState: Story = {
  args: {
    placeholder: 'Buscar orden...',
    value: 'zzzz',
    clearable: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="grid max-w-lg gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-search-field [placeholder]="placeholder" [value]="value" [clearable]="clearable"></josanz-search-field>
        <div class="rounded-2xl border border-dashed p-5 text-center" style="border-color: var(--josanz-border); color: var(--josanz-text-muted);">
          No hay órdenes que coincidan con “{{ value }}”.
        </div>
      </section>
    `,
  }),
};
