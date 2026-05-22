import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import {
  sbEmit,
  sbPaginationArgTypes,
  sbShapeArgTypes,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { PaginationComponent } from './pagination';

const meta: Meta<PaginationComponent> = {
  component: PaginationComponent,
  title: 'Josanz UI / Pagination',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Paginación con variantes `figma` (selector compacto actual/total) y `numbered` (páginas 1…N con elipsis). La página activa usa color de marca; `shape` y `customColor` siguen la convención de `josanz-button`. Emite `pageChange`.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    current: { control: 'number', description: 'Página actual (1-based)' },
    total: { control: 'number', description: 'Total de páginas' },
    ...sbPaginationArgTypes,
    ...sbShapeArgTypes,
    pageChange: sbEmit('pageChange', 'Nueva página'),
  },
};

export default meta;
type Story = StoryObj<PaginationComponent>;

const paginationTemplate = `
  <div class="inline-block min-w-[320px] rounded-xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
    <josanz-pagination
      [current]="current"
      [total]="total"
      [variant]="variant"
      [shape]="shape"
      [customColor]="customColor"
      (pageChange)="pageChange($event)"
    ></josanz-pagination>
  </div>
`;

export const Playground: Story = {
  args: {
    current: 1,
    total: 12,
    variant: 'figma',
    shape: 'rounded',
  },
  render: (args) => ({ props: args, template: paginationTemplate }),
};

export const FigmaVariant: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Variante Figma: bloque compacto con selector desplegable de página.',
      },
    },
  },
  args: {
    current: 3,
    total: 18,
    variant: 'figma',
    shape: 'pill',
  },
  render: (args) => ({ props: args, template: paginationTemplate }),
};

export const NumberedVariant: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Variante numerada clásica con elipsis alrededor de la página activa.',
      },
    },
  },
  args: {
    current: 9,
    total: 24,
    variant: 'numbered',
    shape: 'rounded',
  },
  render: (args) => ({ props: args, template: paginationTemplate }),
};

export const ManyPages: Story = {
  parameters: {
    docs: { description: { story: 'Muchas páginas en modo numerado.' } },
  },
  args: {
    current: 9,
    total: 24,
    variant: 'numbered',
    shape: 'rounded',
  },
  render: (args) => ({ props: args, template: paginationTemplate }),
};

export const Progression: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Inicio, mitad y final de lista (variante numbered).' } },
  },
  render: () => ({
    template: `
      <div class="flex max-w-3xl flex-col gap-10 rounded-3xl border border-solid p-10" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <section>
          <h4 class="mb-4 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Inicio</h4>
          <josanz-pagination variant="numbered" [current]="1" [total]="10"></josanz-pagination>
        </section>
        <section>
          <h4 class="mb-4 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Mitad</h4>
          <josanz-pagination variant="numbered" [current]="5" [total]="10"></josanz-pagination>
        </section>
        <section>
          <h4 class="mb-4 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Final</h4>
          <josanz-pagination variant="numbered" [current]="10" [total]="10"></josanz-pagination>
        </section>
      </div>
    `,
  }),
};

export const InteractiveFigmaPicker: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Interaction test: abre el selector compacto, elige página 5 y comprueba que `current` se actualiza en la story.',
      },
    },
  },
  args: {
    current: 2,
    total: 8,
    variant: 'figma',
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="inline-block min-w-[320px] rounded-xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-pagination
          [current]="current"
          [total]="total"
          [variant]="variant"
          [shape]="shape"
          [customColor]="customColor"
          (pageChange)="current = $event; pageChange($event)"
        ></josanz-pagination>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('2 / 8')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /ir a página/i }));
    await userEvent.click(canvas.getByRole('option', { name: '5' }));
    await expect(canvas.getByText('5 / 8')).toBeInTheDocument();
  },
};

export const InteractiveNumberedNext: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Interaction test: pulsa siguiente en la variante numerada y valida que la página activa pasa de 4 a 5.',
      },
    },
  },
  args: {
    current: 4,
    total: 10,
    variant: 'numbered',
    shape: 'pill',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="inline-block min-w-[320px] rounded-xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-pagination
          [current]="current"
          [total]="total"
          [variant]="variant"
          [shape]="shape"
          [customColor]="customColor"
          (pageChange)="current = $event; pageChange($event)"
        ></josanz-pagination>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '4' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: /página siguiente/i }));
    await expect(canvas.getByRole('button', { name: '5' })).toHaveAttribute('aria-current', 'page');
  },
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Uso recomendado por contexto: selector compacto para listados Figma y numerada para tablas densas.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <section class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 class="m-0 text-sm font-black" style="color: var(--josanz-text);">Clientes</h4>
            <p class="m-0 text-xs" style="color: var(--josanz-text-muted);">Selector compacto: ocupa poco espacio en toolbar.</p>
          </div>
          <josanz-pagination variant="figma" [current]="3" [total]="18" shape="pill"></josanz-pagination>
        </section>
        <section class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 class="m-0 text-sm font-black" style="color: var(--josanz-text);">Facturas</h4>
            <p class="m-0 text-xs" style="color: var(--josanz-text-muted);">Numerada: ideal para tablas con lectura secuencial.</p>
          </div>
          <josanz-pagination variant="numbered" [current]="9" [total]="24"></josanz-pagination>
        </section>
      </div>
    `,
  }),
};
