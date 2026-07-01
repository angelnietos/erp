import { Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import type { Prisma } from '@prisma/client';

export interface TenantCatalogThemeDto {
  eventStatusColors: Record<string, string>;
  clientTariffColors: Record<string, string>;
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function normalizeHex(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (HEX_RE.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }
  return null;
}

function sanitizeColorMap(
  input: Record<string, unknown> | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input || typeof input !== 'object') {
    return out;
  }
  for (const [key, value] of Object.entries(input)) {
    const color = normalizeHex(value);
    if (color && key.trim()) {
      out[key.trim()] = color;
    }
  }
  return out;
}

@Injectable()
export class TenantCatalogThemeService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalogTheme(tenantId: string): Promise<TenantCatalogThemeDto> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { catalogTheme: true },
    });
    return this.mapFromJson(tenant?.catalogTheme);
  }

  async updateCatalogTheme(
    tenantId: string,
    body: TenantCatalogThemeDto,
  ): Promise<TenantCatalogThemeDto> {
    const payload: TenantCatalogThemeDto = {
      eventStatusColors: sanitizeColorMap(body.eventStatusColors),
      clientTariffColors: sanitizeColorMap(body.clientTariffColors),
    };

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        catalogTheme: payload as unknown as Prisma.InputJsonValue,
      },
      select: { catalogTheme: true },
    });

    return this.mapFromJson(updated.catalogTheme);
  }

  private mapFromJson(raw: unknown): TenantCatalogThemeDto {
    const value = (raw ?? {}) as Record<string, unknown>;
    return {
      eventStatusColors: sanitizeColorMap(
        value.eventStatusColors as Record<string, unknown> | undefined,
      ),
      clientTariffColors: sanitizeColorMap(
        value.clientTariffColors as Record<string, unknown> | undefined,
      ),
    };
  }
}
