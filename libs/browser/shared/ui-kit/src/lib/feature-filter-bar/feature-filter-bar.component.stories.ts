import type { Meta, StoryObj } from '@storybook/angular';
import { bindStoryProps } from '../../../.storybook/bind-story-props';
import { sbSelect } from '../../../.storybook/story-arg-types';
import { UiButtonComponent } from '../button/button.component';
import { UiTabsComponent } from '../tabs/tabs.component';
import { UiFeatureFilterBarComponent } from './feature-filter-bar.component';

const meta: Meta<UiFeatureFilterBarComponent> = {
  component: UiFeatureFilterBarComponent,
  title: 'UiFeatureFilterBarComponent',
  tags: ['autodocs'],
  argTypes: {
    framed: { control: 'boolean', description: 'Tarjeta con fondo/borde' },
    appearance: sbSelect(['feature', 'minimal'] as const, 'Barra de búsqueda'),
    searchVariant: sbSelect(['default', 'filled', 'glass'] as const, 'Campo búsqueda'),
    placeholder: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<UiFeatureFilterBarComponent>;

const tabs = [
  { id: 'all', label: 'Todos', badge: 12 },
  { id: 'a', label: 'Disponibles', badge: 8 },
];

export const WithStates: Story = {
  args: {
    framed: true,
    appearance: 'feature',
    searchVariant: 'glass',
    placeholder: 'BUSCAR POR NOMBRE, TIPO O DESCRIPCIÓN...',
  },
  render: (args) => ({
    props: {
      ...bindStoryProps(args),
      tabs,
      activeTab: 'all',
      onTabChange: (id: string) => {
        console.log('tab', id);
      },
    },
    moduleMetadata: {
      imports: [
        UiFeatureFilterBarComponent,
        UiButtonComponent,
        UiTabsComponent,
      ],
    },
    template: `
      <div style="padding:1rem;background:var(--surface,#0f1016);max-width:1100px">
        <ui-feature-filter-bar
          [framed]="framed"
          [appearance]="appearance"
          [searchVariant]="searchVariant"
          [placeholder]="placeholder"
          (searchChange)="onSearch($event)"
        >
          <div uiFeatureFilterStates>
            <ui-tabs
              [tabs]="tabs"
              [activeTab]="activeTab"
              variant="underline"
              (tabChange)="onTabChange($event)"
            ></ui-tabs>
          </div>
          <ui-button variant="ghost" size="sm" icon="filter">Filtros avanzados</ui-button>
          <ui-button variant="ghost" size="sm" icon="rotate-cw">Actualizar</ui-button>
          <ui-button variant="ghost" size="sm" icon="chevron-up">Ordenar: nombre</ui-button>
        </ui-feature-filter-bar>
      </div>
    `,
  }),
};

export const SearchOnly: Story = {
  args: {
    framed: true,
    appearance: 'feature',
    searchVariant: 'glass',
    placeholder: 'BUSCAR EN EL LOG POR USUARIO, ACCIÓN O ENTIDAD...',
  },
  render: (args) => ({
    props: bindStoryProps(args),
    moduleMetadata: {
      imports: [UiFeatureFilterBarComponent, UiButtonComponent],
    },
    template: `
      <div style="padding:1rem;background:var(--surface,#0f1016);max-width:960px">
        <ui-feature-filter-bar
          [framed]="framed"
          [appearance]="appearance"
          [searchVariant]="searchVariant"
          [placeholder]="placeholder"
          (searchChange)="onSearch($event)"
        >
          <ui-button variant="ghost" size="sm" icon="rotate-cw">Actualizar</ui-button>
        </ui-feature-filter-bar>
      </div>
    `,
  }),
};
