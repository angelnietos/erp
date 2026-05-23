import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { SpinnerComponent } from './spinner';

const meta: Meta<SpinnerComponent> = {
  component: SpinnerComponent,
  title: 'Josanz UI / Spinner',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SpinnerComponent] })],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Indicador de carga circular para acciones asíncronas.'),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Texto visible junto al spinner' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del indicador',
    },
    customColor: { control: 'color', description: 'Color opcional del indicador' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible para lectores de pantalla' },
    srText: { control: 'text', description: 'Texto solo para lector de pantalla' },
  },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Playground: Story = {
  args: { label: 'Sincronizando datos...', size: 'md' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-8 p-8" style="background: var(--josanz-bg);">
        <josanz-spinner size="sm" label="sm"></josanz-spinner>
        <josanz-spinner size="md" label="md"></josanz-spinner>
        <josanz-spinner size="lg" label="lg"></josanz-spinner>
      </div>
    `,
  }),
};
