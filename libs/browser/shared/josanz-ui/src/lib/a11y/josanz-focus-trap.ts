/** Utilidades compartidas de focus trap para overlays (modal, drawer, etc.). */
export function josanzFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function josanzFocusFirst(root: HTMLElement | undefined): void {
  if (!root) {
    return;
  }
  const items = josanzFocusableElements(root);
  (items[0] ?? root).focus();
}

export function josanzHandleTabTrap(event: KeyboardEvent, root: HTMLElement | undefined): void {
  if (!root || event.key !== 'Tab') {
    return;
  }
  const items = josanzFocusableElements(root);
  if (!items.length) {
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
