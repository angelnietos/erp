import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PlatformTenantApiService,
  type PlatformSaasUserRow,
} from './platform-tenant-api.service';

@Component({
  standalone: true,
  selector: 'app-platform-users-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './platform-users-page.component.html',
  styleUrl: './platform-users-page.component.css',
})
export class PlatformUsersPageComponent {
  private readonly api = inject(PlatformTenantApiService);

  readonly users = signal<PlatformSaasUserRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly syncingId = signal<string | null>(null);

  readonly email = signal('');
  readonly password = signal('');
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly isActive = signal(true);
  readonly syncToKeycloak = signal(true);

  constructor() {
    void this.load();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.email.set('');
    this.password.set('');
    this.firstName.set('');
    this.lastName.set('');
    this.isActive.set(true);
    this.syncToKeycloak.set(true);
    this.showForm.set(true);
    this.error.set(null);
  }

  openEdit(user: PlatformSaasUserRow): void {
    this.editingId.set(user.id);
    this.email.set(user.email);
    this.password.set('');
    this.firstName.set(user.firstName ?? '');
    this.lastName.set(user.lastName ?? '');
    this.isActive.set(user.isActive);
    this.syncToKeycloak.set(true);
    this.showForm.set(true);
    this.error.set(null);
  }

  async save(): Promise<void> {
    const mail = this.email().trim();
    if (!mail) {
      this.error.set('Email obligatorio.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    try {
      const editing = this.editingId();
      if (editing) {
        await this.api.updatePlatformUser(editing, {
          email: mail,
          password: this.password() || undefined,
          firstName: this.firstName().trim() || undefined,
          lastName: this.lastName().trim() || undefined,
          isActive: this.isActive(),
          syncToKeycloak: this.syncToKeycloak(),
        });
      } else {
        const pw = this.password();
        if (pw.length < 6) {
          this.error.set('Contraseña mínima 6 caracteres.');
          return;
        }
        await this.api.createPlatformUser({
          email: mail,
          password: pw,
          firstName: this.firstName().trim() || undefined,
          lastName: this.lastName().trim() || undefined,
          isActive: this.isActive(),
          syncToKeycloak: this.syncToKeycloak(),
        });
      }
      this.showForm.set(false);
      await this.load();
      this.success.set('Usuario de plataforma guardado.');
    } catch {
      this.error.set('Error al guardar el usuario.');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(user: PlatformSaasUserRow): Promise<void> {
    if (!window.confirm(`Eliminar ${user.email} del panel SaaS?`)) return;
    try {
      await this.api.deletePlatformUser(user.id);
      await this.load();
      this.success.set('Usuario eliminado.');
    } catch {
      this.error.set('No se pudo eliminar el usuario.');
    }
  }

  async syncKc(user: PlatformSaasUserRow): Promise<void> {
    this.syncingId.set(user.id);
    this.error.set(null);
    try {
      const pw = this.password();
      const result = await this.api.syncPlatformUserToKeycloak(
        user.id,
        pw || undefined,
      );
      if (result.ok) {
        this.success.set(`Keycloak sincronizado para ${user.email}.`);
        await this.load();
      } else {
        this.error.set(result.reason ?? 'Error de sincronización.');
      }
    } catch {
      this.error.set('No se pudo sincronizar con Keycloak.');
    } finally {
      this.syncingId.set(null);
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.users.set(await this.api.listPlatformUsers());
    } catch {
      this.error.set('Error cargando usuarios de plataforma.');
    } finally {
      this.loading.set(false);
    }
  }
}
