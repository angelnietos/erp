import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  UserRepositoryPort,
  USER_REPOSITORY,
  User,
} from '@josanz-erp/identity-core';
import {
  User as UserApi,
} from '@josanz-erp/identity-api';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../dtos/user.dtos';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<UserApi[]> {
    const users = await this.userRepository.findAll();
    
    // Fetch all roles for this tenant to resolve permissions efficiently
    const rolesData = await this.prisma.role.findMany({
      select: { name: true, permissions: true }
    });
    
    const rolePermissionsMap = new Map<string, string[]>(
      rolesData.map(r => [r.name, r.permissions])
    );

    return users.map((user) => {
      const allPerms = new Set<string>();
      user.roles.forEach(roleName => {
        const perms = rolePermissionsMap.get(roleName) || [];
        perms.forEach(p => allPerms.add(p));
      });

      return {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: user.roles,
        permissions: Array.from(allPerms),
        category: user.category,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
      };
    });
  }

  async findById(id: string): Promise<UserApi> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rolesData = await this.prisma.role.findMany({
      where: { name: { in: user.roles } },
      select: { permissions: true }
    });
    
    const permissions = Array.from(new Set(rolesData.flatMap(r => r.permissions)));

    return {
      id: user.id.value,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles,
      permissions,
      category: user.category,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }

  async create(dto: CreateUserDto): Promise<UserApi> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = User.create({
      email: dto.email,
      passwordHash: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: dto.roles,
      category: dto.category,
    });

    await this.userRepository.save(user);

    return {
      id: user.id.value,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles,
      permissions: [],
      category: user.category,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserApi> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if email is being changed
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Update user entity
    user.updateProfile(dto.firstName, dto.lastName, dto.category);

    // Update email if provided
    if (dto.email) {
      (user as any).props.email = dto.email;
    }

    // Update roles if provided
    if (dto.roles) {
      (user as any).props.roles = dto.roles;
    }

    // Update active status if provided
    if (dto.isActive !== undefined) {
      (user as any).props.isActive = dto.isActive;
    }

    await this.userRepository.save(user);

    return {
      id: user.id.value,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles,
      permissions: [],
      category: user.category,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
  }
}
