# Auth JWT

JWT authentication library providing guard, strategy, and service for JWT-based authentication.

## Usage

### Protect a Route

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@josanz-erp/auth-jwt';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get('data')
  getData() {
    return { data: 'secure data' };
  }
}
```

### Configure JWT Strategy

```typescript
import { Module } from '@nestjs/common';
import { JwtStrategy } from '@josanz-erp/auth-jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
```

### Use JWT Service

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@josanz-erp/auth-jwt';

@Injectable()
class AuthService {
  constructor(private jwtService: JwtService) {}

  generateToken(userId: string, email: string, roles: string[]) {
    return this.jwtService.sign({
      sub: userId,
      email,
      roles,
    });
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}
```

## API

### Guards

- **JwtAuthGuard**: Protects routes by validating JWT tokens

### Strategies

- **JwtStrategy**: Passport strategy for JWT authentication

### Services

- **JwtService**: Utility service for token operations (sign, verify, decode)

### Types

```typescript
interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

interface JwtUser {
  userId: string;
  email: string;
  roles: string[];
}
```
