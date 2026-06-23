import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { ClsTenantFromJwtInterceptor } from './interceptors/cls-tenant-from-jwt.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Global()
@Module({
  imports: [PrismaModule, ClsModule.forFeature()],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClsTenantFromJwtInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [PrismaModule, ClsModule],
})
export class SharedInfrastructureModule {}
