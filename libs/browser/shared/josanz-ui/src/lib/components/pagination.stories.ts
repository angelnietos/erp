import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { PaginationComponent } from './pagination';

const meta: Meta<PaginationComponent> = {
  component: PaginationComponent,
  title: 'Josanz UI / Pagination',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Paginación numérica con elipsis, anterior/siguiente y `aria-label`. Botones usan `surface`, `border` y `text` del tema; la página activa usa el color de marca y texto con contraste automático. `shape` y `customColor` siguen la convención de `josanz-button`. Emite `pageChange`.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    current: { control: 'number', description: 'Página actual (1-based)' },
    total: { control: 'number', description: 'Total de páginas' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Esquinas de los botones'),
    customColor: { control: 'color', description: 'Color de la página activa (reemplaza el primario del tema)' },
    pageChange: sbEmit('pageChange', 'Nueva página'),
  },
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Playground: Story = {
  args: {
    current: 1,
    total: 12,
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6 bg-white rounded-xl border border-slate-100 shadow-sm inline-block min-w-[320px]">
        <josanz-pagination
          [current]="current"
          [total]="total"
          [shape]="shape"
          [customColor]="customColor"
          (pageChange)="pageChange($event)"
        ></josanz-pagination>
      </div>
    `,
  }),
};

export const ManyPages: Story = {
  parameters: {
    docs: { description: { story: 'Muchas páginas: comprueba elipsis y ventana alrededor de la actual.' } },
  },
  args: {
    current: 9,
    total: 24,
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6 bg-white rounded-xl border border-slate-100">
        <josanz-pagination
          [current]="current"
          [total]="total"
          [shape]="shape"
          [customColor]="customColor"
          (pageChange)="pageChange($event)"
        ></josanz-pagination>
      </div>
    `,
  }),
};

export const Progression: Story = {
  parameters: {
    docs: { description: { story: 'Inicio, mitad y final de lista con el mismo total.' } },
  },
  render: () => ({
    template: `
      <div class="flex flex-col gap-10 p-10 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-3xl">
        <section>
          <h4 class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Inicio de lista</h4>
          <josanz-pagination [current]="1" [total]="10"></josanz-pagination>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Mitad</h4>
          <josanz-pagination [current]="5" [total]="10"></josanz-pagination>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Final</h4>
          <josanz-pagination [current]="10" [total]="10"></josanz-pagination>
        </section>
      </div>
    `,
  }),
};
