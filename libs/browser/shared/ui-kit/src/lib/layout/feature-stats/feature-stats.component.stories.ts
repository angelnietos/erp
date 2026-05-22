import type { Meta, StoryObj } from '@storybook/angular';
import { UiFeatureStatsComponent } from './feature-stats.component';

const meta: Meta<UiFeatureStatsComponent> = {
  component: UiFeatureStatsComponent,
  title: 'UiFeatureStatsComponent',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UiFeatureStatsComponent>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <ui-feature-stats>
        <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-soft);">
          <h4>Stat 1</h4>
          <p>Value: 123</p>
        </div>
        <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-soft);">
          <h4>Stat 2</h4>
          <p>Value: 456</p>
        </div>
        <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-soft);">
          <h4>Stat 3</h4>
          <p>Value: 789</p>
        </div>
      </ui-feature-stats>
    `,
  }),
};

export const Collapsed: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <ui-feature-stats>
        <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-soft);">
          <h4>Hidden Stat</h4>
          <p>This is collapsed by default.</p>
        </div>
      </ui-feature-stats>
    `,
  }),
};
