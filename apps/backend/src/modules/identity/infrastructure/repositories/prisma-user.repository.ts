import { Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-data-access';
import { UserRepositoryPort, User } from '@josanz-erp/identity-core';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const data = await (this.prisma as any).user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const data = await (this.prisma as any).user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async save(user: User): Promise<void> {
    const { id, email, passwordHash, firstName, lastName, isActive, createdAt } = user as any;
    
    await (this.prisma as any).user.upsert({
      where: { id: id.value },
      update: { email, password: passwordHash, firstName, lastName, isActive },
      create: {
        id: id.value,
        email,
        password: passwordHash,
        firstName,
        lastName,
        isActive,
        createdAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).user.delete({ where: { id } });
  }

  private mapToDomain(data: any): User {
    return User.reconstitute(data.id, {
      email: data.email,
      passwordHash: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: data.isActive,
      roles: data.roles.map((r: any) => r.role.name),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
