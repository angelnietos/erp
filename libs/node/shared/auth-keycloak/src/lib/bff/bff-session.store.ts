import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import type { BffSessionRecord } from './bff-session.entity';

export interface BffSessionStorePort {
  create(session: Omit<BffSessionRecord, 'id' | 'createdAt'>): Promise<BffSessionRecord>;
  get(id: string): Promise<BffSessionRecord | undefined>;
  update(
    id: string,
    patch: Partial<Pick<BffSessionRecord, 'accessToken' | 'refreshToken' | 'expiresAt'>>,
  ): Promise<BffSessionRecord | undefined>;
  delete(id: string): Promise<void>;
  purgeExpired(): Promise<number>;
}

export const BFF_SESSION_STORE = Symbol('BFF_SESSION_STORE');

const KEY_PREFIX = 'bff:session:';

/** En dev, sobrevive al hot-reload de Nest (mismo proceso). */
function devSessionBackingStore(): Map<string, BffSessionRecord> {
  const g = globalThis as typeof globalThis & {
    __josanzBffSessions?: Map<string, BffSessionRecord>;
  };
  g.__josanzBffSessions ??= new Map();
  return g.__josanzBffSessions;
}

@Injectable()
export class InMemoryBffSessionStore implements BffSessionStorePort, OnModuleDestroy {
  private readonly sessions =
    process.env['NODE_ENV'] === 'production'
      ? new Map<string, BffSessionRecord>()
      : devSessionBackingStore();

  async create(session: Omit<BffSessionRecord, 'id' | 'createdAt'>): Promise<BffSessionRecord> {
    const record: BffSessionRecord = {
      ...session,
      id: randomUUID(),
      createdAt: Date.now(),
    };
    this.sessions.set(record.id, record);
    return record;
  }

  async get(id: string): Promise<BffSessionRecord | undefined> {
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

  async update(
    id: string,
    patch: Partial<Pick<BffSessionRecord, 'accessToken' | 'refreshToken' | 'expiresAt'>>,
  ): Promise<BffSessionRecord | undefined> {
    const current = await this.get(id);
    if (!current) {
      return undefined;
    }
    const next = { ...current, ...patch };
    this.sessions.set(id, next);
    return next;
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async purgeExpired(): Promise<number> {
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

  onModuleDestroy(): void {
    if (process.env['NODE_ENV'] === 'production') {
      this.sessions.clear();
    }
  }
}

/** Sesiones BFF en Redis — multi-nodo / ISO 27001 sesión centralizada. */
@Injectable()
export class RedisBffSessionStore implements BffSessionStorePort, OnModuleDestroy {
  private readonly logger = new Logger(RedisBffSessionStore.name);
  private client: Redis | null = null;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL');
    if (url) {
      this.client = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
      this.client.connect().catch((err: Error) => {
        this.logger.error(`Redis BFF connect failed: ${err.message}`);
      });
      this.logger.log('BFF session store: Redis');
    }
  }

  private ensureClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not configured');
    }
    return this.client;
  }

  private ttlSeconds(expiresAt: number): number {
    return Math.max(60, Math.ceil((expiresAt - Date.now()) / 1000));
  }

  async create(session: Omit<BffSessionRecord, 'id' | 'createdAt'>): Promise<BffSessionRecord> {
    const record: BffSessionRecord = {
      ...session,
      id: randomUUID(),
      createdAt: Date.now(),
    };
    const redis = this.ensureClient();
    await redis.setex(
      KEY_PREFIX + record.id,
      this.ttlSeconds(record.expiresAt),
      JSON.stringify(record),
    );
    return record;
  }

  async get(id: string): Promise<BffSessionRecord | undefined> {
    const redis = this.ensureClient();
    const raw = await redis.get(KEY_PREFIX + id);
    if (!raw) return undefined;
    const record = JSON.parse(raw) as BffSessionRecord;
    if (record.expiresAt <= Date.now()) {
      await redis.del(KEY_PREFIX + id);
      return undefined;
    }
    return record;
  }

  async update(
    id: string,
    patch: Partial<Pick<BffSessionRecord, 'accessToken' | 'refreshToken' | 'expiresAt'>>,
  ): Promise<BffSessionRecord | undefined> {
    const current = await this.get(id);
    if (!current) return undefined;
    const next = { ...current, ...patch };
    const redis = this.ensureClient();
    await redis.setex(
      KEY_PREFIX + id,
      this.ttlSeconds(next.expiresAt),
      JSON.stringify(next),
    );
    return next;
  }

  async delete(id: string): Promise<void> {
    await this.ensureClient().del(KEY_PREFIX + id);
  }

  async purgeExpired(): Promise<number> {
    return 0;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }
}

export function provideBffSessionStore() {
  return {
    provide: BFF_SESSION_STORE,
    useFactory: (config: ConfigService, memory: InMemoryBffSessionStore) => {
      const url = config.get<string>('REDIS_URL');
      if (url) {
        return new RedisBffSessionStore(config);
      }
      return memory;
    },
    inject: [ConfigService, InMemoryBffSessionStore],
  };
}
