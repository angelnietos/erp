/**
 * Stories often bind (output)="onSomething($event)" without defining those functions on `props`.
 * That yields undefined handlers and can break the Angular story root (black canvas).
 */
const noop = (): void => undefined;

const STORY_HANDLER_DEFAULTS: Record<string, () => void> = {
  onItemClick: noop,
  onTabChange: noop,
  onPageChange: noop,
  onClosed: noop,
  onSearch: noop,
  onCardClicked: noop,
  onEditClicked: noop,
  onDeleteClicked: noop,
  onActionClicked: noop,
};

export function bindStoryProps<T extends Record<string, unknown>>(args: T): T {
  const out = { ...args } as Record<string, unknown>;
  for (const [key, fn] of Object.entries(STORY_HANDLER_DEFAULTS)) {
    if (out[key] === undefined) {
      out[key] = fn;
    }
  }
  return out as T;
}
