/* eslint-disable @nx/enforce-module-boundaries -- paquete npm `dexie`, no un proyecto Nx */
import Dexie, { type Table } from 'dexie';

/** Fila almacenada: metadatos indexables + JSON completo del documento. */
export interface DocumentTableRecord {
  id: string;
  title: string;
  client: string;
  type: string;
  date: string;
  updatedAt: string;
  payloadJson: string;
}

/**
 * Instancia IndexedDB dedicada al Generador de Documentos (Dexie).
 * Nombre: `josanz-document-generator` — no comparte con otras apps del ERP.
 */
export class DocumentsDexie extends Dexie {
  documents!: Table<DocumentTableRecord, string>;

  constructor() {
    super('josanz-document-generator');
    this.version(1).stores({
      documents: 'id, type, date, updatedAt',
    });
  }
}

export const documentsDexie = new DocumentsDexie();
