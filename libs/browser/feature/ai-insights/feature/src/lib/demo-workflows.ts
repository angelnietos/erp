export type DemoWorkflowId =
  | 'stock-replenishment'
  | 'client-offer'
  | 'sick-leave-substitute'
  | 'dashboard-kpi-scan';

export interface DemoWorkflowDefinition {
  id: DemoWorkflowId;
  title: string;
  description: string;
  icon: string;
  badge: string;
  summary: string;
  /** Ruta inicial recomendada (Buddy/domain bot montado ahí). */
  startRoute: string;
  buildActions: (ctx: DemoWorkflowContext) => Record<string, unknown>[];
}

export interface DemoWorkflowContext {
  today: string;
  friday: string;
  /** UUID del técnico Dani Sonido (seed Josanz), si está disponible. */
  daniTechId?: string;
}

function nextFriday(from = new Date()): string {
  const d = new Date(from);
  const day = d.getDay();
  const diff = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function createDemoWorkflowContext(daniTechId?: string): DemoWorkflowContext {
  return {
    today: new Date().toISOString().split('T')[0],
    friday: nextFriday(),
    daniTechId,
  };
}

export const DEMO_WORKFLOWS: DemoWorkflowDefinition[] = [
  {
    id: 'stock-replenishment',
    title: 'Stock crítico → presupuesto',
    description:
      'Filtra inventario sin stock, delega a Cali-Bot un borrador de reposición y notifica al usuario.',
    icon: 'package-search',
    badge: 'Inventario + Presupuestos',
    summary: 'Demo: localizar stock 0 y preparar borrador de compra con Cali-Bot.',
    startRoute: '/inventory',
    buildActions: () => [
      { type: 'navigateAndFilter', payload: { url: '/inventory', query: 'stock 0' } },
      { type: 'wait', payload: { ms: 700 } },
      {
        type: 'delegate',
        payload: {
          target: 'budgets',
          instruction:
            'Prepara borrador de compra con Audiovisuales Madrid para reponer 10 unidades de Altavoz Autoamplificado',
        },
      },
      {
        type: 'notify',
        payload: {
          message: 'Workflow demo: stock crítico revisado y tarea enviada a Cali-Bot',
          variant: 'success',
        },
      },
    ],
  },
  {
    id: 'client-offer',
    title: 'Lead → oferta comercial',
    description: 'Abre el cliente Eventos Global, delega oferta de alquiler a Cali-Bot.',
    icon: 'handshake',
    badge: 'Clientes + Presupuestos',
    summary: 'Demo: ficha de cliente y borrador de oferta simultáneo.',
    startRoute: '/clients',
    buildActions: () => [
      {
        type: 'navigateAndFilter',
        payload: { url: '/clients', query: 'Eventos Global' },
      },
      { type: 'wait', payload: { ms: 600 } },
      {
        type: 'delegate',
        payload: {
          target: 'budgets',
          instruction:
            'Prepara nueva oferta de alquiler con 4 Proyectores Láser 4K para Eventos Global S.L.',
        },
      },
      {
        type: 'notify',
        payload: {
          message: 'Workflow demo: cliente localizado y oferta en preparación',
          variant: 'success',
        },
      },
    ],
  },
  {
    id: 'sick-leave-substitute',
    title: 'Baja médica + sustituto',
    description:
      'Registra baja de Dani Sonido, revisa el evento Concierto Verano 2026 y delega sustituto AUDIO.',
    icon: 'user-round-cog',
    badge: 'Personal + Eventos',
    summary: 'Demo: baja registrada, evento revisado y sustitución en People-Bot.',
    startRoute: '/events',
    buildActions: (ctx) => {
      const steps: Record<string, unknown>[] = [];
      if (ctx.daniTechId) {
        steps.push({
          type: 'setAvailabilityRange',
          payload: {
            techId: ctx.daniTechId,
            status: 'SICK_LEAVE',
            dates: [ctx.today, ctx.friday],
          },
        });
        steps.push({ type: 'wait', payload: { ms: 500 } });
      }
      steps.push(
        {
          type: 'navigateAndFilter',
          payload: { url: '/events', query: 'Concierto Verano 2026' },
        },
        { type: 'wait', payload: { ms: 500 } },
        {
          type: 'delegate',
          payload: {
            target: 'users',
            instruction:
              'Busca técnico con habilidad AUDIO disponible para sustituir a Dani Sonido esta semana',
          },
        },
        {
          type: 'notify',
          payload: {
            message: ctx.daniTechId
              ? 'Workflow demo: baja registrada y sustitución en curso'
              : 'Workflow demo: evento revisado (sin técnico seed — delegación a People-Bot)',
            variant: 'success',
          },
        },
      );
      return steps;
    },
  },
  {
    id: 'dashboard-kpi-scan',
    title: 'Escaneo KPIs del panel',
    description: 'Vuelve al dashboard y aplica un filtro de demostración en inventario bajo mínimos.',
    icon: 'line-chart',
    badge: 'Panel + Inventario',
    summary: 'Demo: revisión rápida de KPIs y salto a inventario filtrado.',
    startRoute: '/',
    buildActions: () => [
      { type: 'navigate', payload: { url: '/' } },
      { type: 'wait', payload: { ms: 500 } },
      { type: 'navigateAndFilter', payload: { url: '/inventory', query: 'Altavoz' } },
      {
        type: 'notify',
        payload: {
          message: 'Workflow demo: KPIs revisados y filtro de inventario aplicado',
          variant: 'info',
        },
      },
    ],
  },
];
