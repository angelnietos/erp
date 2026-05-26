import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  sbEmit,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { BreadcrumbsComponent } from './breadcrumbs';

const meta: Meta<BreadcrumbsComponent> = {
  component: BreadcrumbsComponent,
  title: 'Josanz UI / Breadcrumbs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Migas de pan genéricas para navegación jerárquica en apps, paneles de administración y flujos de detalle.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    separator: { control: 'text', description: 'Separador visible' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible del nav' },
    itemClick: sbEmit('itemClick', 'Click en item navegable'),
  },
};

export default meta;
type Story = StoryObj<BreadcrumbsComponent>;

export const Playground: Story = {
  args: {
    separator: '/',
    items: [
      { label: 'Dashboard', href: '#' },
      { label: 'Clientes', href: '#' },
      { label: 'NovaByte', current: true },
    ],
  },
};

export const DeepNavigation: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid gap-4 rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-breadcrumbs
          separator="›"
          [items]="[
            { label: 'ERP', href: '#' },
            { label: 'Eventos', href: '#' },
            { label: 'Gala Primavera 2026', href: '#' },
            { label: 'Producción', current: true }
          ]"
        ></josanz-breadcrumbs>
        <h2 class="m-0 text-2xl font-black" style="color: var(--josanz-text);">Producción</h2>
      </div>
    `,
  }),
};

export const InteractiveNavigation: Story = {
  args: {
    separator: '›',
    itemClick: fn(),
    items: [
      { label: 'Inicio', href: '#' },
      { label: 'Facturación', href: '#' },
      { label: 'INV-2026-004', current: true },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('link', { name: /facturación/i }));
    await expect(args.itemClick).toHaveBeenCalledTimes(1);
  },
};
