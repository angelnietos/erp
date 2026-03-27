import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async save(user: User): Promise<void> {
    const { id, email, passwordHash, firstName, lastName, isActive, createdAt } = user as any;
    
    await this.prisma.user.upsert({
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
    await this.prisma.user.delete({ where: { id } });
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
