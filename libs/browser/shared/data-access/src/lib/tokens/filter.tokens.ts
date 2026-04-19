import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interfaz genérica para cualquier servicio que pueda filtrar una entidad de negocio.
 * T es el tipo de la entidad (ej: Proyecto, Cliente, Técnico).
 */
export interface FilterableService<T> {
  filter(query: string): Observable<T[]>;
}

/**
 * Token de Inyección para proveer el servicio de filtrado específico de cada feature.
 * Esto permite que el Shell o componentes compartidos no necesiten conocer la lógica interna.
 */
export const FILTER_PROVIDER = new InjectionToken<FilterableService<unknown>>(
  'JosanzFilterProvider',
);
