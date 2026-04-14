import type { Meta, StoryObj } from '@storybook/angular';
import { bindStoryProps } from '../../../.storybook/bind-story-props';
import { sbSelect } from '../../../.storybook/story-arg-types';
import { UiButtonComponent } from '../button/button.component';
import { UiSearchToolbarComponent } from './search-toolbar.component';

const meta: Meta<UiSearchToolbarComponent> = {
  component: UiSearchToolbarComponent,
  title: 'UiSearchToolbarComponent',
  tags: ['autodocs'],
  argTypes: {
    appearance: sbSelect(['feature', 'minimal'] as const, 'Estilo de barra'),
    searchVariant: sbSelect(['default', 'filled', 'glass'] as const, 'Campo de búsqueda'),
    placeholder: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<UiSearchToolbarComponent>;

export const Default: Story = {
  args: {
    appearance: 'feature',
    searchVariant: 'glass',
    placeholder: 'BUSCAR POR NOMBRE, TIPO O DESCRIPCIÓN...',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    moduleMetadata: {
      imports: [UiSearchToolbarComponent, UiButtonComponent],
    },
    template: `
      <div style="padding:1rem;background:var(--surface,#0f1016);max-width:960px">
        <ui-search-toolbar
          [appearance]="appearance"
          [searchVariant]="searchVariant"
          [placeholder]="placeholder"
          (searchChange)="onSearch($event)"
        >
          <ui-button variant="ghost" size="sm" icon="filter">Filtros avanzados</ui-button>
          <ui-button variant="ghost" size="sm" icon="rotate-cw">Actualizar</ui-button>
          <ui-button variant="ghost" size="sm" icon="chevron-down">Ordenar: nombre</ui-button>
        </ui-search-toolbar>
      </div>
    `,
  }),
};

export const Minimal: Story = {
  ...Default,
  args: {
    ...Default.args,
    appearance: 'minimal',
  },
};
