import type { Observable } from 'rxjs';

export type JosanzDeleteFeatureKey = 'clients' | 'events';

export interface JosanzDeleteConfirmRequest {
  feature: JosanzDeleteFeatureKey;
  itemName: string;
  onConfirm: () => void | Observable<unknown>;
}

export interface JosanzDeleteConfirmCopy {
  title: string;
  message: string;
  confirmLabel: string;
}

const DELETE_COPY: Record<
  JosanzDeleteFeatureKey,
  (itemName: string) => JosanzDeleteConfirmCopy
> = {
  clients: (itemName) => ({
    title: '¿Eliminar cliente?',
    message: `Se eliminará «${itemName}» y dejará de aparecer en el listado. Esta acción no se puede deshacer.`,
    confirmLabel: 'Eliminar cliente',
  }),
  events: (itemName) => ({
    title: '¿Eliminar evento?',
    message: `Se eliminará «${itemName}» y dejará de aparecer en el listado. Esta acción no se puede deshacer.`,
    confirmLabel: 'Eliminar evento',
  }),
};

export function josanzDeleteConfirmCopy(
  feature: JosanzDeleteFeatureKey,
  itemName: string,
): JosanzDeleteConfirmCopy {
  const label = itemName.trim() || 'este registro';
  return DELETE_COPY[feature](label);
}
