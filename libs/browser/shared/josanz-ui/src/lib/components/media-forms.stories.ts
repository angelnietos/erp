import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
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
};

export default meta;
type Story = StoryObj;

export const MediaAndFormsSuite: Story = {
  render: () => ({
    template: `
      <section class="grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <josanz-video-player
          title="Vídeo de montaje"
          description="Player genérico para documentación audiovisual."
          poster="https://picsum.photos/seed/josanz-video-poster/1200/675"
          src=""
        ></josanz-video-player>
        <div class="grid gap-5">
          <josanz-audio-player title="Brief de audio" description="Notas de voz o pistas asociadas al evento." src=""></josanz-audio-player>
          <josanz-rich-text-editor label="Descripción enriquecida" value="<p>Incluye <strong>brief</strong>, condiciones técnicas y notas internas.</p>"></josanz-rich-text-editor>
          <josanz-validation-message tone="error" message="El contrato firmado es obligatorio para publicar."></josanz-validation-message>
          <josanz-validation-message tone="success" message="La documentación técnica está completa."></josanz-validation-message>
        </div>
      </section>
    `,
  }),
};
