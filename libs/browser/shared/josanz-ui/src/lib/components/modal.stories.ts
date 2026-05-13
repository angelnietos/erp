import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal';

const meta: Meta<ModalComponent> = {
  component: ModalComponent,
  title: 'Josanz UI / Modal',
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Título del modal' },
    width: { control: 'text', description: 'Ancho del modal (ej: 712px)' },
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
        <josanz-modal [title]="title" [width]="width">
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
            <div class="flex justify-end gap-3 mt-4">
              <div class="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm">Cancelar</div>
              <div class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">Guardar Cambios</div>
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
        <josanz-modal [title]="title" [width]="width">
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
