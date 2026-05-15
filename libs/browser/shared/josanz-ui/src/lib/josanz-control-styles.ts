/**
 * Forma de esquinas alineada con {@link ButtonComponent} (`rounded` / `pill` / `square`).
 */
export type JosanzControlShape = 'rounded' | 'pill' | 'square';

/** Botón principal y secundario (listas): mismo radio que `ButtonComponent`. */
export function josanzCornerButton(shape: JosanzControlShape | string | undefined): string {
  switch (shape) {
    case 'pill':
      return 'rounded-full';
    case 'square':
      return 'rounded-none';
    default:
      return 'rounded-[10px]';
  }
}

/** Botones, páginas de paginación, inputs, pestañas secundarias… */
export function josanzCornerInner(shape: JosanzControlShape | string | undefined): string {
  switch (shape) {
    case 'pill':
      return 'rounded-full';
    case 'square':
      return 'rounded-sm';
    default:
      return 'rounded-lg';
  }
}

/** Contenedor tipo “segmented” (main-tabs): radio exterior un poco mayor */
export function josanzCornerShell(shape: JosanzControlShape | string | undefined): string {
  switch (shape) {
    case 'pill':
      return 'rounded-full';
    case 'square':
      return 'rounded-md';
    default:
      return 'rounded-xl';
  }
}

/** Campos de texto: pill muy redondeado, square casi recto */
export function josanzCornerField(shape: JosanzControlShape | string | undefined): string {
  switch (shape) {
    case 'pill':
      return 'rounded-full';
    case 'square':
      return 'rounded-[2px]';
    default:
      return 'rounded-[6px]';
  }
}

/** Avatar: `rounded` = suavizado, `pill` = círculo, `square` = casi cuadrado */
export function josanzCornerAvatar(shape: JosanzControlShape | string | undefined): string {
  switch (shape) {
    case 'pill':
      return 'rounded-full';
    case 'square':
      return 'rounded-md';
    default:
      return 'rounded-[28px]';
  }
}

/** Panel de modal (grande): `rounded` ≈ 3xl, `pill` muy redondeado, `square` discreto */
export function josanzCornerModal(shape: JosanzControlShape | string | undefined): string {
  switch (shape) {
    case 'pill':
      return 'rounded-[2.5rem]';
    case 'square':
      return 'rounded-lg';
    default:
      return 'rounded-3xl';
  }
}
