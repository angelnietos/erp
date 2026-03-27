import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort, USER_REPOSITORY } from '@josanz-erp/identity-core';
import { LoginDto } from '../dtos/login.dto';

type AuthenticatedUserView = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; user: AuthenticatedUserView }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is deactivated');
    }

    const payload = { 
      sub: user.id.value, 
      email: user.email, 
      roles: user.roles 
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async validateUser(email: string, pass: string): Promise<AuthenticatedUserView | null> {
    const user = await this.userRepository.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      };
    }
    return null;
  }
}
