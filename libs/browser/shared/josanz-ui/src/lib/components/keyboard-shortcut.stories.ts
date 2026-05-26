import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { KeyboardShortcutComponent } from './keyboard-shortcut';

const meta: Meta<KeyboardShortcutComponent> = {
  component: KeyboardShortcutComponent,
  title: 'Josanz UI / Keyboard Shortcut',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Representacion visual de atajos de teclado para ayudas contextuales, command palette y tooltips.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    keys: { control: 'object' },
    ariaLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<KeyboardShortcutComponent>;

export const Playground: Story = {
  args: {
    keys: ['Ctrl', 'K'],
    ariaLabel: 'Abrir buscador',
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="flex items-center justify-between gap-8">
          <span class="text-sm font-bold" style="color: var(--josanz-text);">Buscar</span>
          <josanz-keyboard-shortcut [keys]="['Ctrl', 'K']"></josanz-keyboard-shortcut>
        </div>
        <div class="flex items-center justify-between gap-8">
          <span class="text-sm font-bold" style="color: var(--josanz-text);">Guardar</span>
          <josanz-keyboard-shortcut [keys]="['Ctrl', 'S']"></josanz-keyboard-shortcut>
        </div>
        <div class="flex items-center justify-between gap-8">
          <span class="text-sm font-bold" style="color: var(--josanz-text);">Comando avanzado</span>
          <josanz-keyboard-shortcut [keys]="['Ctrl', 'Shift', 'P']"></josanz-keyboard-shortcut>
        </div>
      </div>
    `,
  }),
};

export const AccessibilityCheck: Story = {
  args: {
    keys: ['Ctrl', 'Enter'],
    ariaLabel: 'Enviar formulario',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/enviar formulario/i)).toHaveTextContent('Ctrl+Enter');
  },
};
