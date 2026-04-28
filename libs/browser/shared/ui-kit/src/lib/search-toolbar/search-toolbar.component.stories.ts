
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
