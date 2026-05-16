import type { JosanzAdaptiveListItem } from '../components/adaptive-list-rows';

/** Filtra filas de listado por título, campos visibles y estado. */
export function filterAdaptiveListItems(
  items: readonly JosanzAdaptiveListItem[],
  query: string,
): JosanzAdaptiveListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...items];
  }
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.data.some((cell) => cell.toLowerCase().includes(q)) ||
      (item.status?.toLowerCase().includes(q) ?? false),
  );
}
