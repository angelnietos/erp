/** Anchos de columna compartidos entre cabecera de listado y `josanz-main-template-card`. */
export function josanzListFieldWidthClass(
  index: number,
  fieldCount: number,
): string {
  if (fieldCount === 3) {
    if (index === 0) {
      return 'josanz-list-template-row__field--w160';
    }
    if (index === 1) {
      return 'josanz-list-template-row__field--w220';
    }
    return 'josanz-list-template-row__field--grow';
  }

  if (index === 0) {
    return 'josanz-list-template-row__field--w220';
  }
  if (index === fieldCount - 1) {
    return 'josanz-list-template-row__field--grow';
  }
  return 'josanz-list-template-row__field--w160';
}
