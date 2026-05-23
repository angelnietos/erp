import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription, sbEmit, sbRadio } from '../../../.storybook/story-arg-types';
import { AudioPlayerComponent, VideoPlayerComponent } from './media-player';
import { RichTextEditorComponent } from './rich-text-editor';
import { ValidationMessageComponent } from './validation-message';
import { TextareaComponent } from './textarea';

const meta: Meta = {
  title: 'Josanz UI / Media & Rich Forms',
  decorators: [
    moduleMetadata({
      imports: [
        VideoPlayerComponent,
        AudioPlayerComponent,
        RichTextEditorComponent,
        ValidationMessageComponent,
        TextareaComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Video player, audio player, rich text editor y mensajes de validación de formularios.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Título del bloque multimedia o formulario.' },
    description: { control: 'text', description: 'Descripción auxiliar del recurso.' },
    src: { control: 'text', description: 'URL del audio o vídeo.' },
    poster: { control: 'text', description: 'Imagen previa del vídeo.' },
    label: { control: 'text', description: 'Etiqueta de campos rich text / textarea.' },
    value: { control: 'text', description: 'HTML o texto inicial del campo.' },
    tone: sbRadio(['error', 'success', 'warning', 'info'] as const, 'Tono del mensaje de validación'),
    valueChange: sbEmit('valueChange', 'Cambio de contenido del campo'),
    format: sbEmit('format', 'Comando de formato del rich text'),
  },
};

export default meta;
type Story = StoryObj;

export const MediaAndFormsSuite: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Ficha de orden de taller: vídeo de inspección, nota de voz del técnico, descripción del parte y validaciones del formulario.',
      },
    },
  },
  render: () => ({
    template: `
      <section class="grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <josanz-video-player
          title="Inspección de frenos · ORD-1042"
          description="Grabación del técnico en el elevador (BMW X1, matrícula 4821 KLM)."
          poster="https://picsum.photos/seed/josanz-taller-frenos/1200/675"
          src=""
        ></josanz-video-player>
        <div class="grid gap-5">
          <josanz-audio-player title="Nota de voz del técnico" description="Cliente avisa de ruido al frenar en bajada." src=""></josanz-audio-player>
          <josanz-rich-text-editor label="Trabajos realizados" value="<p>Sustitución de <strong>pastillas delanteras</strong>. Líquido de frenos dentro de tolerancia.</p>"></josanz-rich-text-editor>
          <josanz-textarea label="Observaciones internas" value="Pieza OEM solicitada al proveedor; ETA mañana 10:00."></josanz-textarea>
          <josanz-validation-message tone="error" message="La firma del cliente es obligatoria antes de cerrar la orden."></josanz-validation-message>
          <josanz-validation-message tone="success" message="Checklist de seguridad completado y archivado."></josanz-validation-message>
        </div>
      </section>
    `,
  }),
};
