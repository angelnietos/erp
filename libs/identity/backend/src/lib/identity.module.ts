import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { type StringValue } from 'ms';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { USER_REPOSITORY } from '@josanz-erp/identity-core';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';

@Module({
  imports: [
    PassportModule,
    SharedInfrastructureModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = (config.get<string>('JWT_EXPIRES') ?? '24h') as StringValue;
        return {
          secret: config.get<string>('JWT_SECRET') ?? 'default_secret',
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [AuthService, JwtStrategy],
})
export class IdentityModule {}

