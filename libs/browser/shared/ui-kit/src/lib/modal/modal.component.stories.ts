import type { Meta, StoryObj } from '@storybook/angular';

/** Historias pendientes — archivo mínimo para que Storybook indexe sin error CSF. */
const meta: Meta = {
  title: 'UI Kit / Modal',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const Pending: Story = {
  render: () => ({
    template: '<p>Historias de modal: por definir.</p>',
  }),
};
