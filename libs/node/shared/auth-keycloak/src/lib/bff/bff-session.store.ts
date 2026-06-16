import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { BffSessionRecord } from './bff-session.entity';

export interface BffSessionStorePort {
  create(session: Omit<BffSessionRecord, 'id' | 'createdAt'>): BffSessionRecord;
  get(id: string): BffSessionRecord | undefined;
  update(id: string, patch: Partial<Pick<BffSessionRecord, 'accessToken' | 'refreshToken' | 'expiresAt'>>): BffSessionRecord | undefined;
  delete(id: string): void;
  purgeExpired(): number;
}

@Injectable()
export class InMemoryBffSessionStore implements BffSessionStorePort {
  private readonly sessions = new Map<string, BffSessionRecord>();

  create(session: Omit<BffSessionRecord, 'id' | 'createdAt'>): BffSessionRecord {
    const record: BffSessionRecord = {
      ...session,
      id: randomUUID(),
      createdAt: Date.now(),
    };
    this.sessions.set(record.id, record);
    return record;
  }

  get(id: string): BffSessionRecord | undefined {
    const record = this.sessions.get(id);
    if (!record) {
      return undefined;
    }
    if (record.expiresAt <= Date.now()) {
      this.sessions.delete(id);
      return undefined;
    }
    return record;
  }

  update(
    id: string,
    patch: Partial<Pick<BffSessionRecord, 'accessToken' | 'refreshToken' | 'expiresAt'>>,
  ): BffSessionRecord | undefined {
    const current = this.get(id);
    if (!current) {
      return undefined;
    }
    const next = { ...current, ...patch };
    this.sessions.set(id, next);
    return next;
  }

  delete(id: string): void {
    this.sessions.delete(id);
  }

  purgeExpired(): number {
    const now = Date.now();
    let removed = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }
}
