import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Forma mínima de los ítems que devuelve el filtro global (paleta de comandos, búsqueda contextual).
 * Las entidades de dominio pueden añadir campos; solo se usan id / name / label / description en UI.
 */
export interface MasterFilterResultItem {
  id?: string | number;
  name?: string;
  label?: string;
  description?: string;
}

/**
 * Interfaz genérica para cualquier servicio que pueda filtrar una entidad de negocio.
 * T es el tipo de la entidad (ej: Proyecto, Cliente, Técnico).
 */
export interface FilterableService<
  T extends MasterFilterResultItem = MasterFilterResultItem,
> {
  filter(query: string): Observable<T[]>;
}

/**
 * Token de Inyección para proveer el servicio de filtrado específico de cada feature.
 * Esto permite que el Shell o componentes compartidos no necesiten conocer la lógica interna.
 */
export const FILTER_PROVIDER = new InjectionToken<
  FilterableService<MasterFilterResultItem>
>('JosanzFilterProvider');
