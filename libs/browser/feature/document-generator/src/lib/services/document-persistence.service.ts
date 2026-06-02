import { Injectable } from '@angular/core';
import { documentsDexie } from '../db/documents-dexie';
import type { DocumentTableRecord } from '../db/documents-dexie';

/**
 * Persistencia del historial de documentos (Dexie + IndexedDB).
 * Migra claves antiguas `localStorage` (`document_*`).
 */
const LEGACY_PREFIX = 'document_';

export interface DocumentListItem {
  id: string;
  title: string;
  client: string;
  date: Date;
  type: string;
  /** Sin PDF generado aún o marcado como borrador. */
  isDraft?: boolean;
}

export interface DocumentPersistedPayload {
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class DocumentPersistenceService {
  private initPromise: Promise<void> | null = null;

  whenReady(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.runInit();
    }
    return this.initPromise;
  }

  private async runInit(): Promise<void> {
    await documentsDexie.open();
    await this.migrateFromLocalStorage();
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
    for (const key of keys) {
      const id = key.slice(LEGACY_PREFIX.length);
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }
      const existing = await documentsDexie.documents.get(id);
      if (existing) {
        localStorage.removeItem(key);
        continue;
      }
      try {
        const row = this.buildRowFromPayloadJson(id, raw);
        await documentsDexie.documents.put(row);
        localStorage.removeItem(key);
      } catch {
        /* corrupto: no borrar LS */
      }
    }
  }

  private buildRowFromPayloadJson(
    id: string,
    payloadJson: string,
  ): DocumentTableRecord {
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

  private isPayloadDraft(payload: DocumentPersistedPayload): boolean {
    if (payload['isDraft'] === true) {
      return true;
    }
    const bytes = payload['pdfBytes'];
    return !Array.isArray(bytes) || bytes.length === 0;
  }

  async listSummaries(): Promise<DocumentListItem[]> {
    const rows = await documentsDexie.documents.toArray();
    return rows
      .map((r) => {
        let isDraft = false;
        try {
          const p = JSON.parse(r.payloadJson) as DocumentPersistedPayload;
          isDraft = this.isPayloadDraft(p);
        } catch {
          isDraft = true;
        }
        return {
          id: r.id,
          title: r.title,
          client: r.client,
          type: r.type,
          date: new Date(r.date),
          isDraft,
        };
      })
      .sort((a, b) => +b.id - +a.id);
  }

  async getPayload(id: string): Promise<DocumentPersistedPayload | null> {
    const row = await documentsDexie.documents.get(id);
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
    await documentsDexie.documents.put(row);
  }

  async delete(id: string): Promise<void> {
    await documentsDexie.documents.delete(id);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`${LEGACY_PREFIX}${id}`);
    }
  }
}
