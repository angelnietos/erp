import type { ConfigService } from '@nestjs/config';

/** `REDIS_URL` o `redis://REDIS_HOST:REDIS_PORT` (p. ej. docker compose). */
export function resolveRedisUrl(config: ConfigService): string | undefined {
  const direct = config.get<string>('REDIS_URL')?.trim();
  if (direct) {
    return direct;
  }
  const host = config.get<string>('REDIS_HOST')?.trim();
  if (!host) {
    return undefined;
  }
  const port = config.get<string>('REDIS_PORT')?.trim() || '6379';
  const password = config.get<string>('REDIS_PASSWORD')?.trim();
  if (password) {
    return `redis://:${encodeURIComponent(password)}@${host}:${port}`;
  }
  return `redis://${host}:${port}`;
}
