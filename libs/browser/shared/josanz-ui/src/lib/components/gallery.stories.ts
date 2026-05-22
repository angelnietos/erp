import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { GalleryComponent, type JosanzGalleryItem } from './gallery';

const SAMPLE_IMAGES: JosanzGalleryItem[] = [
  {
    id: 'stage',
    src: 'https://picsum.photos/seed/josanz-stage/720/520',
    alt: 'Escenario principal con iluminación',
    title: 'Escenario principal',
    subtitle: 'Montaje AV · Sevilla',
    badge: 'Evento',
  },
  {
    id: 'sound',
    src: 'https://picsum.photos/seed/josanz-sound/720/520',
    alt: 'Mesa de sonido preparada',
    title: 'Control de sonido',
    subtitle: 'Prueba técnica',
    badge: 'Audio',
  },
  {
    id: 'truck',
    src: 'https://picsum.photos/seed/josanz-truck/720/520',
    alt: 'Vehículo logístico cargado',
    title: 'Logística',
    subtitle: 'Salida de almacén',
    badge: 'Flota',
  },
];

const meta: Meta<GalleryComponent> = {
  component: GalleryComponent,
  title: 'Josanz UI / Gallery',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Galería genérica seleccionable para imágenes de eventos, documentación visual, productos o adjuntos. Soporta `shape`, color de marca y salida `itemSelect`.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Título de la galería' },
    description: { control: 'text', description: 'Texto auxiliar' },
    items: { control: 'object', description: 'Imágenes de la galería' },
    selectedId: { control: 'text', description: 'Imagen seleccionada' },
    columns: { control: 'number', description: 'Columnas de la grilla' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    customColor: { control: 'color', description: 'Color de selección/badge' },
    itemSelect: sbEmit('itemSelect', 'Imagen seleccionada'),
    selectedIdChange: sbEmit('selectedIdChange', 'ID seleccionado'),
  },
};

export default meta;
type Story = StoryObj<GalleryComponent>;

export const Playground: Story = {
  args: {
    title: 'Galería del evento',
    description: 'Selecciona una imagen para verla en detalle o asociarla al informe.',
    items: SAMPLE_IMAGES,
    selectedId: 'stage',
    columns: 3,
    shape: 'rounded',
    customColor: '#635BFF',
  },
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Usos habituales: evento, inventario visual y documentación de cliente.' } },
  },
  render: () => ({
    template: `
      <div class="grid max-w-7xl gap-8" style="background: var(--josanz-bg);">
        <josanz-gallery title="Evento · Gala Primavera" description="Fotos para informe final" [items]="images" selectedId="sound" customColor="#635BFF"></josanz-gallery>
        <josanz-gallery title="Material AV" description="Estado visual de equipos" [items]="inventoryImages" [columns]="2" shape="pill" customColor="var(--josanz-success)"></josanz-gallery>
      </div>
    `,
    props: {
      images: SAMPLE_IMAGES,
      inventoryImages: SAMPLE_IMAGES.map((item) => ({ ...item, badge: 'Equipo' })),
    },
  }),
};

export const InteractiveSelection: Story = {
  args: {
    title: 'Galería interactiva',
    items: SAMPLE_IMAGES,
    selectedId: '',
    columns: 3,
    itemSelect: fn(),
    selectedIdChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /abrir imagen mesa de sonido preparada/i }));
    await expect(args.selectedIdChange).toHaveBeenCalledWith('sound');
    await expect(args.itemSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'sound' }));
  },
};
