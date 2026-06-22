import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import * as bcrypt from 'bcrypt';
import { KeycloakIdentitySyncService } from './keycloak-identity-sync.service';

export interface PlatformUserView {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  keycloakLinked: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePlatformUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  syncToKeycloak?: boolean;
}

export interface UpdatePlatformUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  syncToKeycloak?: boolean;
}

@Injectable()
export class PlatformUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kcSync: KeycloakIdentitySyncService,
  ) {}

  private toView(
    row: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date | null;
    },
    keycloakLinked: boolean,
  ): PlatformUserView {
    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName ?? undefined,
      lastName: row.lastName ?? undefined,
      isActive: row.isActive,
      keycloakLinked,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt?.toISOString(),
    };
  }

  async findAll(): Promise<PlatformUserView[]> {
    const rows = await this.prisma.platformUser.findMany({
      orderBy: { email: 'asc' },
    });

    const views: PlatformUserView[] = [];
    for (const row of rows) {
      const linked = await this.kcSync.isPlatformUserLinkedInKeycloak(row.email);
      views.push(this.toView(row, linked));
    }
    return views;
  }

  async findById(id: string): Promise<PlatformUserView> {
    const row = await this.prisma.platformUser.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Usuario de plataforma no encontrado');
    }
    const linked = await this.kcSync.isPlatformUserLinkedInKeycloak(row.email);
    return this.toView(row, linked);
  }

  async create(dto: CreatePlatformUserDto): Promise<PlatformUserView> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.platformUser.findUnique({
      where: { email },
    });
    if (existing) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const row = await this.prisma.platformUser.create({
      data: {
        email,
        password: hashed,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        isActive: dto.isActive ?? true,
      },
    });

    if (dto.syncToKeycloak !== false) {
      void this.kcSync
        .syncPlatformUserToKeycloak(row.id, { password: dto.password })
        .catch(() => undefined);
    }

    const linked = await this.kcSync.isPlatformUserLinkedInKeycloak(row.email);
    return this.toView(row, linked);
  }

  async update(id: string, dto: UpdatePlatformUserDto): Promise<PlatformUserView> {
    const row = await this.prisma.platformUser.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Usuario de plataforma no encontrado');
    }

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const existing = await this.prisma.platformUser.findFirst({
        where: { email, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException('El correo ya está registrado');
      }
    }

    const data: {
      email?: string;
      password?: string;
      firstName?: string | null;
      lastName?: string | null;
      isActive?: boolean;
    } = {};

    if (dto.email) data.email = dto.email.trim().toLowerCase();
    if (dto.firstName !== undefined) data.firstName = dto.firstName || null;
    if (dto.lastName !== undefined) data.lastName = dto.lastName || null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.platformUser.update({
      where: { id },
      data,
    });

    if (dto.syncToKeycloak !== false) {
      void this.kcSync
        .syncPlatformUserToKeycloak(updated.id, {
          password: dto.password,
        })
        .catch(() => undefined);
    }

    const linked = await this.kcSync.isPlatformUserLinkedInKeycloak(
      updated.email,
    );
    return this.toView(updated, linked);
  }

  async delete(id: string): Promise<void> {
    const row = await this.prisma.platformUser.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Usuario de plataforma no encontrado');
    }
    await this.prisma.platformUser.delete({ where: { id } });
  }

  async syncToKeycloak(
    id: string,
    password?: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    const result = await this.kcSync.syncPlatformUserToKeycloak(id, {
      password,
    });
    return { ok: result.ok, reason: result.reason };
  }
}
