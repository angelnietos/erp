import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { RichTextEditorComponent } from './rich-text-editor';

const meta: Meta<RichTextEditorComponent> = {
  component: RichTextEditorComponent,
  title: 'Josanz UI / Rich Text Editor',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Editor contenteditable con barra de formato basica para notas internas y documentacion.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    ariaLabel: { control: 'text' },
    valueChange: sbEmit('valueChange', 'Cambio de HTML'),
    format: sbEmit('format', 'Comando de formato'),
  },
};

export default meta;
type Story = StoryObj<RichTextEditorComponent>;

export const Playground: Story = {
  args: {
    label: 'Notas del parte',
    value: '<p>Revision de <strong>frenos</strong> y pastillas.</p>',
    valueChange: fn(),
    format: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-6 md:grid-cols-2">
        <josanz-rich-text-editor label="Nota interna" value="<p>Cliente avisa de ruido al frenar.</p>"></josanz-rich-text-editor>
        <josanz-rich-text-editor label="Checklist" value="<ul><li>Pastillas revisadas</li><li>Liquido comprobado</li></ul>"></josanz-rich-text-editor>
      </div>
    `,
  }),
};

export const InteractiveFormat: Story = {
  args: {
    label: 'Editor interactivo',
    value: '<p>Texto de prueba</p>',
    valueChange: fn(),
    format: fn(),
  },
  play: async ({ args, canvasElement }) => {
    if (!document.execCommand) {
      document.execCommand = () => true;
    }
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'B' }));
    await expect(args.format).toHaveBeenCalledWith('bold');
  },
};
