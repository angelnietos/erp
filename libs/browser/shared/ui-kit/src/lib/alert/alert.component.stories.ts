
export default meta;
type Story = StoryObj<UiAlertComponent>;

export const Error: Story = {
  args: {
    variant: 'error',
  },
  render: (args) => ({
    props: args,
    template: `<ui-alert [variant]="variant">Este es un mensaje de error.</ui-alert>`,
  }),
};

export const Success: Story = {
  args: {
    variant: 'success',
  },
  render: (args) => ({
    props: args,
    template: `<ui-alert [variant]="variant">Acción completada con éxito.</ui-alert>`,
  }),
};
