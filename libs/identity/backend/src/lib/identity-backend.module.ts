import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { type StringValue } from 'ms';
import { USER_REPOSITORY } from '@josanz-erp/identity-core';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';
// Import from the main backend module - these will need to be moved to the library
// For now, we'll create a basic module structure

/**
 * Identity Backend Module
 * NestJS module that provides backend infrastructure for the identity feature
 */
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
  providers: [
    {
      provide: USER_REPOSITORY,
      useValue: {}, // TODO: Implement PrismaUserRepository
    },
  ],
  exports: [USER_REPOSITORY],
})
export class IdentityBackendModule {}