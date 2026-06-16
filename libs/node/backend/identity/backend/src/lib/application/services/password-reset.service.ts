import { Injectable, Logger, Optional, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  AuditLogWriterService,
  EMAIL_PORT,
  EmailPort,
  PrismaService,
} from '@josanz-erp/shared-infrastructure';

const RESET_TTL_MS = 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function isKeycloakManagedPassword(password: string): boolean {
  return password.startsWith('keycloak:');
}

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly auditLogWriter: AuditLogWriterService,
    @Optional() @Inject(EMAIL_PORT) private readonly email?: EmailPort,
  ) {}

  private frontendBaseUrl(): string {
    return (
      this.config.get<string>('FRONTEND_URL')?.replace(/\/$/, '') ||
      this.config.get<string>('CORS_ORIGIN')?.split(',')[0]?.trim() ||
      'http://localhost:4200'
    );
  }

  private assertPasswordStrength(password: string): void {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      );
    }
  }

  /** Siempre responde igual (no revela si el email existe). */
  async requestReset(
    email: string,
    tenantSlug: string,
  ): Promise<{ ok: true; devResetUrl?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const slug = tenantSlug.trim().toLowerCase();

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, isActive: true },
    });
    if (!tenant?.isActive) {
      return { ok: true };
    }

    const user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail, tenantId: tenant.id, isActive: true },
      select: { id: true, email: true, password: true, firstName: true },
    });
    if (!user || isKeycloakManagedPassword(user.password)) {
      return { ok: true };
    }

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        tokenHash: hashToken(rawToken),
        expiresAt,
      },
    });

    const resetUrl = `${this.frontendBaseUrl()}/auth/reset-password?token=${encodeURIComponent(rawToken)}&tenant=${encodeURIComponent(slug)}`;
    const html = `
      <p>Hola${user.firstName ? ` ${user.firstName}` : ''},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña en Babooni ERP.</p>
      <p><a href="${resetUrl}">Restablecer contraseña</a></p>
      <p>El enlace caduca en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>
    `;

    try {
      await this.email?.send({
        to: user.email,
        subject: 'Restablecer contraseña — Babooni ERP',
        html,
        referenceType: 'PASSWORD_RESET',
        referenceId: user.id,
      });
    } catch (err) {
      this.logger.warn(`Password reset email failed: ${String(err)}`);
    }

    this.logger.log(`Password reset requested for ${user.email} (tenant=${slug})`);

    const isDev = this.config.get<string>('NODE_ENV') !== 'production';
    return isDev ? { ok: true, devResetUrl: resetUrl } : { ok: true };
  }

  /** Invitación al crear usuario: enlace para establecer contraseña inicial. */
  async sendAccountInvite(
    userId: string,
    tenantSlug: string,
  ): Promise<{ devInviteUrl?: string }> {
    const slug = tenantSlug.trim().toLowerCase();
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, isActive: true, name: true },
    });
    if (!tenant?.isActive) {
      return {};
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId: tenant.id, isActive: true },
      select: { id: true, email: true, password: true, firstName: true },
    });
    if (!user || isKeycloakManagedPassword(user.password)) {
      return {};
    }

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        tokenHash: hashToken(rawToken),
        expiresAt,
      },
    });

    const inviteUrl = `${this.frontendBaseUrl()}/auth/reset-password?token=${encodeURIComponent(rawToken)}&tenant=${encodeURIComponent(slug)}`;
    const orgName = tenant.name?.trim() || 'Babooni ERP';
    const html = `
      <p>Hola${user.firstName ? ` ${user.firstName}` : ''},</p>
      <p>Te han invitado a <strong>${orgName}</strong> en Babooni ERP.</p>
      <p><a href="${inviteUrl}">Activar cuenta y elegir contraseña</a></p>
      <p>El enlace caduca en 1 hora. Si no esperabas este correo, puedes ignorarlo.</p>
    `;

    try {
      await this.email?.send({
        to: user.email,
        subject: `Invitación a ${orgName} — Babooni ERP`,
        html,
        referenceType: 'USER_INVITE',
        referenceId: user.id,
      });
    } catch (err) {
      this.logger.warn(`Invite email failed for ${user.email}: ${String(err)}`);
    }

    this.logger.log(`Account invite sent for ${user.email} (tenant=${slug})`);
    const isDev = this.config.get<string>('NODE_ENV') !== 'production';
    return isDev ? { devInviteUrl: inviteUrl } : {};
  }

  async resetWithToken(token: string, newPassword: string): Promise<{ ok: true }> {
    this.assertPasswordStrength(newPassword);
    const tokenHash = hashToken(token.trim());

    const record = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      include: { user: { select: { id: true, email: true, password: true, isActive: true } } },
    });

    if (!record?.user?.isActive) {
      throw new BadRequestException('Enlace inválido o caducado');
    }
    if (isKeycloakManagedPassword(record.user.password)) {
      throw new BadRequestException(
        'Esta cuenta usa Keycloak SSO. Restablece la contraseña desde el portal de identidad.',
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed, updatedAt: new Date() },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    void this.auditLogWriter
      .record(record.userId, {
        action: 'PASSWORD_RESET',
        targetEntity: 'Auth:password',
        changesJson: {
          entityType: 'USER',
          entityName: record.user.email,
          details: 'Contraseña restablecida vía enlace',
        },
      })
      .catch(() => undefined);

    return { ok: true };
  }

  async changePassword(
    userId: string,
    tenantId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: true }> {
    this.assertPasswordStrength(newPassword);

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, isActive: true },
      select: { id: true, email: true, password: true },
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (isKeycloakManagedPassword(user.password)) {
      throw new BadRequestException(
        'Tu cuenta usa Keycloak SSO. Cambia la contraseña desde el portal de identidad.',
      );
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, updatedAt: new Date() },
    });

    void this.auditLogWriter
      .record(user.id, {
        action: 'PASSWORD_CHANGE',
        targetEntity: 'Auth:password',
        changesJson: {
          entityType: 'USER',
          entityName: user.email,
          details: 'Contraseña cambiada desde configuración',
        },
      })
      .catch(() => undefined);

    return { ok: true };
  }
}
