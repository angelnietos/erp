
export default meta;
type Story = StoryObj<DetailPlaceholderComponent>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `<ui-detail-placeholder></ui-detail-placeholder>`,
  }),
};
