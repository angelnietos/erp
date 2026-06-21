import type { JosanzDetailLayoutVariant } from '../main-detail-layout';
import type { JosanzStatusPillKey } from '../../theme/josanz-figma-tokens';

/** Visibilidad de bloques en detalle Figma. */
export interface JosanzFigmaDetailShellFeatures {
  /** Footer fijo Guardar/Cancelar (layout default). Por defecto: false en figma-event. */
  footerActions?: boolean;
  /** Pill de estado junto al título. Por defecto: hay `statusLabel`. */
  statusPill?: boolean;
  /** Avatar usuario cabecera. Por defecto: true. */
  avatar?: boolean;
  /** Botón guardar en barra de tabs (figma-event). Por defecto: true. */
  headerSave?: boolean;
}

export interface JosanzFigmaDetailShellConfig {
  title: string;
  /** Ruta del listado padre (`/staff`, `/equipment`…). */
  listRoute: string;
  tabs: string[];
  /** Slugs para `?tab=`; si no se define, se generan desde `tabs`. */
  tabSlugMap?: Record<string, string>;
  layoutVariant?: JosanzDetailLayoutVariant;
  statusLabel?: string;
  statusPillKey?: JosanzStatusPillKey;
  userLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  saveDisabled?: boolean;
  avatarLink?: string | null;
  avatarAriaLabel?: string;
  features?: JosanzFigmaDetailShellFeatures;
}

export interface ResolvedFigmaDetailShellFeatures {
  footerActions: boolean;
  statusPill: boolean;
  avatar: boolean;
  headerSave: boolean;
}

export function resolveFigmaDetailShellFeatures(
  config: JosanzFigmaDetailShellConfig,
): ResolvedFigmaDetailShellFeatures {
  const f = config.features;
  const isFigmaEvent = (config.layoutVariant ?? 'figma-event') === 'figma-event';
  const hasStatus = Boolean(config.statusLabel?.trim());

  return {
    footerActions: f?.footerActions ?? !isFigmaEvent,
    statusPill: f?.statusPill ?? hasStatus,
    avatar: f?.avatar ?? true,
    headerSave: f?.headerSave ?? isFigmaEvent,
  };
}
