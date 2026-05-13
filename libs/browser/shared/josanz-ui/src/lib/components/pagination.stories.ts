import type { Meta, StoryObj } from '@storybook/angular';
import { PaginationComponent } from './pagination';

const meta: Meta<PaginationComponent> = {
  component: PaginationComponent,
  title: 'Josanz UI / Pagination',
  tags: ['autodocs'],
  argTypes: {
    current: { control: 'number', description: 'Página actual (1-based)' },
    total: { control: 'number', description: 'Total de páginas' },
    pageChange: { action: 'pageChange' },
  },
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <josanz-pagination
        [current]="current"
        [total]="total"
        (pageChange)="pageChange($event)"
      ></josanz-pagination>
    `,
  }),
  args: {
    current: 1,
    total: 12,
  },
};

export const Progression: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-10 p-10 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <section>
          <h4 class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Start of list</h4>
          <josanz-pagination [current]="1" [total]="10"></josanz-pagination>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Middle page</h4>
          <josanz-pagination [current]="5" [total]="10"></josanz-pagination>
        </section>

        <section>
          <h4 class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">End of list</h4>
          <josanz-pagination [current]="10" [total]="10"></josanz-pagination>
        </section>
      </div>
    `,
  }),
};
