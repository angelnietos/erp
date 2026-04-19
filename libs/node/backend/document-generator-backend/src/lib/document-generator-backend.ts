/**
 * Punto de extensión reservado. La app `document-generator` persiste el
 * historial en IndexedDB (`DocumentPersistenceService`); un futuro backend
 * podría sincronizar contra esta librería.
 */
export function documentGeneratorBackend(): string {
  return 'document-generator-backend';
}
