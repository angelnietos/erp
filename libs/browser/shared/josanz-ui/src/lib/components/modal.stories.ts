import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
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
        component: josanzStoryThemeDescription(
          'Modal con overlay, título, cuerpo (`ng-content`) y pie opcional (`footer-actions`). El panel usa `atmosphere.surface`; título y contenido respetan `atmosphere.text`. `shape` y `customColor` personalizan panel y título. Emite `close`.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text', description: 'Título del modal' },
    width: { control: 'text', description: 'Ancho CSS (ej. 712px, min(100%, 40rem))' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Esquinas del panel'),
    customColor: { control: 'color', description: 'Color del título' },
    close: sbEmit('close', 'Cierre del modal'),
  },
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Playground: Story = {
  args: {
    title: 'Nueva Factura',
    width: '712px',
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex h-[600px] items-center justify-center overflow-hidden rounded-3xl p-10" style="background: color-mix(in srgb, var(--josanz-bg) 20%, #000);">
        <josanz-modal [title]="title" [width]="width" [shape]="shape" [customColor]="customColor" (close)="close($event)">
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
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex h-[400px] items-center justify-center overflow-hidden rounded-3xl p-10" style="background: color-mix(in srgb, var(--josanz-bg) 20%, #000);">
        <josanz-modal [title]="title" [width]="width" [shape]="shape" [customColor]="customColor" (close)="close($event)">
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
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex h-[480px] items-center justify-center overflow-hidden rounded-3xl p-10" style="background: color-mix(in srgb, var(--josanz-bg) 20%, #000);">
        <josanz-modal [title]="title" [width]="width" [shape]="shape" [customColor]="customColor" (close)="close($event)">
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

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Caso real de producto: modal de envío de presupuesto con contenido y acciones proyectadas.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="min-h-[640px] overflow-hidden rounded-3xl p-10" style="background: color-mix(in srgb, var(--josanz-bg) 20%, #000);">
        <josanz-modal title="Enviar presupuesto" width="560px" shape="rounded" customColor="var(--josanz-primary)">
          <div class="space-y-5">
            <p class="m-0 text-sm leading-relaxed" style="color: var(--josanz-text-muted);">
              Revisa el resumen antes de enviar el presupuesto al cliente. El email incluirá el PDF y el enlace de aceptación.
            </p>
            <div class="rounded-2xl border border-solid p-4" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
              <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Cliente</p>
              <strong class="mt-1 block" style="color: var(--josanz-text);">NovaByte S.L.</strong>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-solid p-4" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
                <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Total</p>
                <strong class="mt-1 block" style="color: var(--josanz-text);">12.450 EUR</strong>
              </div>
              <div class="rounded-2xl border border-solid p-4" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
                <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Validez</p>
                <strong class="mt-1 block" style="color: var(--josanz-text);">15 días</strong>
              </div>
            </div>
          </div>
          <div footer-actions class="flex w-full justify-center gap-3">
            <josanz-button label="Guardar borrador" variant="secondary" [showIcon]="false"></josanz-button>
            <josanz-button label="Enviar presupuesto" variant="primary" [showIcon]="false"></josanz-button>
          </div>
        </josanz-modal>
      </div>
    `,
  }),
};
