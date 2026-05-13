import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit } from '../../../.storybook/story-arg-types';
import { ModalComponent } from './modal';
import { ButtonComponent } from './button';

const meta: Meta<ModalComponent> = {
  component: ModalComponent,
  title: 'Josanz UI / Modal',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Modal a pantalla completa con overlay, título, cuerpo (`ng-content`) y pie opcional (`ng-content select="[footer-actions]"`). Emite `close` al pulsar la X.',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text', description: 'Título del modal' },
    width: { control: 'text', description: 'Ancho CSS (ej. 712px, min(100%, 40rem))' },
    close: sbEmit('close', 'Cierre del modal'),
  },
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Playground: Story = {
  args: {
    title: 'Nueva Factura',
    width: '712px',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[600px] bg-slate-900 flex items-center justify-center p-10 overflow-hidden rounded-3xl">
        <josanz-modal [title]="title" [width]="width" (close)="close($event)">
          <div class="p-8 flex flex-col gap-6">
            <div class="space-y-2">
              <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Concepto</label>
              <div class="h-10 bg-slate-50 border border-slate-200 rounded-lg w-full"></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monto</label>
                <div class="h-10 bg-slate-50 border border-slate-200 rounded-lg w-full"></div>
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fecha</label>
                <div class="h-10 bg-slate-50 border border-slate-200 rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        </josanz-modal>
      </div>
    `,
  }),
};

export const SmallConfirmation: Story = {
  args: {
    title: 'Confirmar Acción',
    width: '400px',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[400px] bg-slate-800 flex items-center justify-center p-10 overflow-hidden rounded-3xl">
        <josanz-modal [title]="title" [width]="width" (close)="close($event)">
          <div class="p-10 text-center">
            <p class="text-slate-600 mb-8 font-medium">¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
            <div class="flex flex-col gap-3">
              <div class="w-full py-3 bg-red-500 text-white rounded-xl font-bold">Sí, Eliminar Registro</div>
              <div class="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold">No, Mantenerlo</div>
            </div>
          </div>
        </josanz-modal>
      </div>
    `,
  }),
};

export const WithFooterActions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Uso del slot `footer-actions` con botones reales del design system.',
      },
    },
  },
  args: {
    title: 'Guardar borrador',
    width: '520px',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[480px] bg-slate-900 flex items-center justify-center p-10 overflow-hidden rounded-3xl">
        <josanz-modal [title]="title" [width]="width" (close)="close($event)">
          <p class="text-slate-600 text-sm leading-relaxed">
            El pie del modal proyecta contenido con el atributo <code class="text-xs bg-slate-100 px-1 rounded">footer-actions</code>.
          </p>
          <div footer-actions class="flex w-full justify-center gap-4">
            <josanz-button label="Cancelar" variant="secondary" (btnClick)="close($event)"></josanz-button>
            <josanz-button label="Guardar" variant="primary" (btnClick)="close($event)"></josanz-button>
          </div>
        </josanz-modal>
      </div>
    `,
  }),
};
