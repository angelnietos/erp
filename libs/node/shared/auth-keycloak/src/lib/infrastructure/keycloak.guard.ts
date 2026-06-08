import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KeycloakAuthGuard extends AuthGuard('keycloak') {}

@Injectable()
export class OptionalKeycloakAuthGuard extends AuthGuard('keycloak') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as boolean;
  }

  handleRequest(err: any, user: any) {
    return user;
  }
}