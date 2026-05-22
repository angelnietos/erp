import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'UI Kit / Kitchen Sink',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const Placeholder: Story = {
  render: () => ({
    template: `
      <div style="padding: 2rem; background: var(--bg-primary); min-height: 100vh; color: var(--text-primary)">
        <p>Área reservada para kitchen sink (demo conjunta).</p>
      </div>
    `,
  }),
};
