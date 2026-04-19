import { Injectable } from '@angular/core';

/**
 * Base de datos del Generador de Documentos en el navegador (IndexedDB).
 * Separada del resto del ERP: nombre `josanz-document-generator` y almacén `documents`.
 * Migra automáticamente entradas antiguas `localStorage` (`document_*`).
 */
const DB_NAME = 'josanz-document-generator';
const DB_VERSION = 1;
const STORE = 'documents';
const LEGACY_PREFIX = 'document_';

export interface DocumentListItem {
  id: string;
  title: string;
  client: string;
  date: Date;
  type: string;
}

export interface DocumentPersistedPayload {
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class DocumentPersistenceService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private initPromise: Promise<void> | null = null;

  /** Listo tras abrir IndexedDB y migrar localStorage (si aplica). */
  whenReady(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.runInit();
    }
    return this.initPromise;
  }

  private async runInit(): Promise<void> {
    await this.openDb();
    await this.migrateFromLocalStorage();
  }

  private openDb(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB no disponible en este entorno'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const os = db.createObjectStore(STORE, { keyPath: 'id' });
          os.createIndex('byUpdatedAt', 'updatedAt', { unique: false });
          os.createIndex('byType', 'type', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () =>
        reject(req.error ?? new Error('No se pudo abrir IndexedDB'));
    });
    return this.dbPromise;
  }

  private async migrateFromLocalStorage(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(LEGACY_PREFIX)) {
        keys.push(k);
      }
    }
    if (keys.length === 0) {
      return;
    }
    const db = await this.openDb();
    for (const key of keys) {
      const id = key.slice(LEGACY_PREFIX.length);
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }
      const existing = await this.getRecordTx(db, id);
      if (existing) {
        localStorage.removeItem(key);
        continue;
      }
      try {
        const row = this.buildRowFromPayloadJson(id, raw);
        await this.putRecordTx(db, row);
        localStorage.removeItem(key);
      } catch {
        /* payload corrupto: no borrar LS para no perder datos */
      }
    }
  }

  private buildRowFromPayloadJson(
    id: string,
    payloadJson: string,
  ): DocumentRecord {
    const data = JSON.parse(payloadJson) as Record<string, unknown>;
    const title =
      (typeof data['title'] === 'string' && data['title']) || 'Sin título';
    const client =
      (typeof data['client'] === 'string' && data['client']) || 'Cliente';
    const type =
      (typeof data['type'] === 'string' && data['type']) || 'documentation';
    let dateIso: string;
    if (data['date'] != null) {
      const d = new Date(String(data['date']));
      dateIso = isNaN(d.getTime())
        ? new Date(+id || Date.now()).toISOString()
        : d.toISOString();
    } else {
      dateIso = new Date(+id || Date.now()).toISOString();
    }
    const updatedAt = new Date().toISOString();
    return {
      id,
      title,
      client,
      type,
      date: dateIso,
      updatedAt,
      payloadJson,
    };
  }

  async listSummaries(): Promise<DocumentListItem[]> {
    const db = await this.openDb();
    const rows = await this.getAllRecordsTx(db);
    return rows
      .map((r) => ({
        id: r.id,
        title: r.title,
        client: r.client,
        type: r.type,
        date: new Date(r.date),
      }))
      .sort((a, b) => +b.id - +a.id);
  }

  async getPayload(id: string): Promise<DocumentPersistedPayload | null> {
    const db = await this.openDb();
    const row = await this.getRecordTx(db, id);
    if (!row) {
      return null;
    }
    try {
      return JSON.parse(row.payloadJson) as DocumentPersistedPayload;
    } catch {
      return null;
    }
  }

  async save(id: string, payload: DocumentPersistedPayload): Promise<void> {
    const payloadJson = JSON.stringify(payload);
    const row = this.buildRowFromPayloadJson(id, payloadJson);
    row.updatedAt = new Date().toISOString();
    const db = await this.openDb();
    await this.putRecordTx(db, row);
  }

  async delete(id: string): Promise<void> {
    const db = await this.openDb();
    await this.deleteRecordTx(db, id);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`${LEGACY_PREFIX}${id}`);
    }
  }

  private getRecordTx(
    db: IDBDatabase,
    id: string,
  ): Promise<DocumentRecord | undefined> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result as DocumentRecord | undefined);
      req.onerror = () => reject(req.error);
    });
  }

  private getAllRecordsTx(db: IDBDatabase): Promise<DocumentRecord[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () =>
        resolve((req.result as DocumentRecord[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  }

  private putRecordTx(db: IDBDatabase, row: DocumentRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).put(row);
    });
  }

  private deleteRecordTx(db: IDBDatabase, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).delete(id);
    });
  }
}

interface DocumentRecord {
  id: string;
  title: string;
  client: string;
  type: string;
  /** ISO */
  date: string;
  /** ISO */
  updatedAt: string;
  payloadJson: string;
}
