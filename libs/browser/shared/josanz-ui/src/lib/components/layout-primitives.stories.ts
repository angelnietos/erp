import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbRadio } from '../../../.storybook/story-arg-types';
import {
  ContainerComponent,
  FlexComponent,
  GridComponent,
  SpacerComponent,
  StackComponent,
} from './layout-primitives';

const meta: Meta<ContainerComponent> = {
  component: ContainerComponent,
  title: 'Josanz UI / Layout Primitives',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ContainerComponent, StackComponent, GridComponent, FlexComponent, SpacerComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Primitivas composables de layout: container, stack, grid, flex y spacer para construir pantallas sin repetir utilidades.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    size: sbRadio(['sm', 'md', 'lg', 'xl', 'full'] as const, 'Ancho maximo de container'),
    ariaLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<ContainerComponent>;

const block = (label: string): string => `
  <div class="rounded-2xl border border-solid p-4 text-sm font-black" style="background: var(--josanz-field-fill); border-color: var(--josanz-border); color: var(--josanz-text);">
    ${label}
  </div>
`;

export const Playground: Story = {
  args: {
    size: 'lg',
    ariaLabel: 'Layout demo',
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-container [size]="size" [ariaLabel]="ariaLabel">
        <div class="py-8">
          <josanz-stack gap="1rem">
            ${block('Header')}
            <josanz-grid [columns]="3" minColumnWidth="160px" gap="1rem">
              ${block('Columna A')}
              ${block('Columna B')}
              ${block('Columna C')}
            </josanz-grid>
            <josanz-flex justify="between" align="center">
              ${block('Acciones')}
              ${block('Estado')}
            </josanz-flex>
          </josanz-stack>
        </div>
      </josanz-container>
    `,
  }),
};

export const Primitives: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid gap-8 p-8" style="background: var(--josanz-bg);">
        <josanz-container size="md" ariaLabel="Container example">
          <h3 class="m-0 mb-3 text-sm font-black" style="color: var(--josanz-text);">Container + Stack</h3>
          <josanz-stack gap="0.75rem">
            ${block('Elemento 1')}
            ${block('Elemento 2')}
          </josanz-stack>
        </josanz-container>

        <josanz-container size="md">
          <h3 class="m-0 mb-3 text-sm font-black" style="color: var(--josanz-text);">Grid responsive</h3>
          <josanz-grid [columns]="4" minColumnWidth="140px" gap="0.75rem">
            ${block('A')}
            ${block('B')}
            ${block('C')}
            ${block('D')}
          </josanz-grid>
        </josanz-container>

        <josanz-container size="md">
          <h3 class="m-0 mb-3 text-sm font-black" style="color: var(--josanz-text);">Flex + Spacer</h3>
          <josanz-flex align="center" justify="between" gap="1rem">
            ${block('Izquierda')}
            <josanz-spacer width="2rem" height="1rem" [block]="false"></josanz-spacer>
            ${block('Derecha')}
          </josanz-flex>
        </josanz-container>
      </div>
    `,
  }),
};

export const AccessibilityCheck: Story = {
  args: {
    size: 'sm',
    ariaLabel: 'Contenedor principal',
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-container [size]="size" [ariaLabel]="ariaLabel">
        ${block('Contenido')}
      </josanz-container>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/contenedor principal/i)).toBeInTheDocument();
  },
};
