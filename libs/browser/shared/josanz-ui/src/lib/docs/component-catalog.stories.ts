import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';

const catalog = [
  {
    group: 'Acciones',
    items: ['Button', 'Secondary Button', 'FAB', 'Copy Button', 'Keyboard Shortcut'],
  },
  {
    group: 'Formularios',
    items: [
      'Input', 'Textarea', 'Select', 'Checkbox', 'Switch', 'Radio Group',
      'Form Field', 'Date Picker', 'Date Time Picker', 'OTP Input',
      'Number Input', 'Password Input', 'Phone Input', 'Currency Input',
      'Chip Input', 'Multi Select', 'Autocomplete', 'File Upload',
      'Search Field', 'Validation Message', 'Reactive Example',
    ],
  },
  {
    group: 'Datos',
    items: [
      'Data Table', 'Data Grid', 'Accordion', 'Timeline', 'Tree View',
      'Kanban', 'Chart', 'Stat Card', 'Adaptive List Rows',
    ],
  },
  {
    group: 'Overlay',
    items: [
      'Modal', 'Drawer', 'Bottom Sheet', 'Confirm Dialog',
      'Popover', 'Dropdown Menu', 'Context Menu', 'Tooltip', 'Command Palette',
    ],
  },
  {
    group: 'Layout',
    items: [
      'Sidebar', 'Navbar', 'Breadcrumb Nav', 'Breadcrumbs', 'Main Tabs',
      'Main List Layout', 'Main Detail Layout', 'Layout Primitives',
      'Container', 'Grid', 'Stack', 'Flex', 'Spacer', 'Pagination',
    ],
  },
  {
    group: 'Feedback',
    items: [
      'Alert', 'Inline Alert', 'Toast', 'Spinner', 'Skeleton',
      'Progress Bar', 'Progress Steps', 'Empty State',
      'Rich Text Editor', 'Media Player', 'Rating', 'Tag',
    ],
  },
  {
    group: 'Polish',
    items: [
      'Badge', 'Card', 'List Item', 'Segmented Control', 'Avatar Group',
      'Color Picker', 'Divider', 'Slider', 'Gallery', 'Carousel',
    ],
  },
];

const meta: Meta = {
  title: 'Josanz UI / Documentacion / Component Catalog',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Índice de cobertura Storybook. Cada componente exportado tiene story dedicada (Playground + variantes) o suite agrupada documentada en MDX por categoría.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

export const CoverageIndex: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { catalog },
    template: `
      <section class="mx-auto max-w-5xl rounded-3xl border border-solid p-8" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <p class="m-0 text-xs font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Josanz UI</p>
        <h1 class="m-0 mt-2 text-3xl font-black" style="color: var(--josanz-text);">Catálogo de componentes</h1>
        <p class="m-0 mt-2 max-w-2xl text-sm" style="color: var(--josanz-text-muted);">
          Referencia para diseño y desarrollo. Consulta también Forms, Data, Layout, Overlays y Feedback en Documentación.
        </p>
        <div class="mt-8 grid gap-6 md:grid-cols-2">
          @for (section of catalog; track section.group) {
            <article class="rounded-2xl border border-solid p-5" style="border-color: var(--josanz-border);">
              <h2 class="m-0 text-sm font-black uppercase tracking-[0.14em]" style="color: var(--josanz-primary);">{{ section.group }}</h2>
              <ul class="m-0 mt-3 grid list-none gap-2 p-0">
                @for (item of section.items; track item) {
                  <li class="rounded-xl px-3 py-2 text-sm font-bold" style="background: color-mix(in srgb, var(--josanz-primary) 8%, var(--josanz-surface)); color: var(--josanz-text);">{{ item }}</li>
                }
              </ul>
            </article>
          }
        </div>
      </section>
    `,
  }),
};
