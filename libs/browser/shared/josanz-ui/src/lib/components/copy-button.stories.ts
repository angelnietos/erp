import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { CopyButtonComponent } from './copy-button';

const meta: Meta<CopyButtonComponent> = {
  component: CopyButtonComponent,
  title: 'Josanz UI / Copy Button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Boton compacto para copiar referencias, codigos o enlaces con confirmacion temporal.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    text: { control: 'text', description: 'Texto copiado al portapapeles' },
    label: { control: 'text' },
    copiedLabel: { control: 'text' },
    ariaLabel: { control: 'text' },
    copiedText: sbEmit('copiedText', 'Texto copiado'),
  },
};

export default meta;
type Story = StoryObj<CopyButtonComponent>;

export const Playground: Story = {
  args: {
    text: 'ORD-2026-1042',
    label: 'Copiar referencia',
    copiedLabel: 'Copiado',
    copiedText: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-copy-button text="ORD-2026-1042" label="Copiar orden"></josanz-copy-button>
        <josanz-copy-button text="https://josanz.local/f/abc" label="Copiar enlace" copiedLabel="Link copiado"></josanz-copy-button>
      </div>
    `,
  }),
};

export const InteractiveCopy: Story = {
  args: {
    text: 'CLIENTE-42',
    label: 'Copiar codigo',
    copiedLabel: 'Copiado',
    copiedText: fn(),
  },
  play: async ({ args, canvasElement }) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined },
    });
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /copiar codigo/i }));
    await expect(args.copiedText).toHaveBeenCalledWith('CLIENTE-42');
    await expect(canvas.getByRole('button', { name: /copiar codigo/i })).toHaveTextContent(/copiado/i);
  },
};
