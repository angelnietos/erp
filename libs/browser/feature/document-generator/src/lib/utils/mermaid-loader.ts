type MermaidApi = typeof import('mermaid')['default'];

let mermaidPromise: Promise<MermaidApi> | null = null;

/** Carga mermaid solo cuando hay diagramas de arquitectura en preview. */
export function loadMermaid(): Promise<MermaidApi> {
  mermaidPromise ??= import('mermaid').then((mod) => mod.default);
  return mermaidPromise;
}
