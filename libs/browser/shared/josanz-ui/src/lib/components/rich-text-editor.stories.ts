import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { RichTextEditorComponent } from './rich-text-editor';

const meta: Meta<RichTextEditorComponent> = {
  component: RichTextEditorComponent,
  title: 'Josanz UI / Rich Text Editor',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Editor contenteditable con barra de formato básica para notas internas y documentación.'),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    valueChange: sbEmit('valueChange', 'Cambio de HTML'),
    format: sbEmit('format', 'Comando de formato'),
  },
};

export default meta;
type Story = StoryObj<RichTextEditorComponent>;

export const Playground: Story = {
  args: {
    label: 'Notas del parte',
    value: '<p>Revisión de <strong>frenos</strong> y pastillas.</p>',
    valueChange: fn(),
    format: fn(),
  },
};
