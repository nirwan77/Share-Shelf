import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { DashboardAuthService } from '../dashboard-auth/dashboard-auth.service';
import { DashboardUserReqObject } from './authDecorator';

@Injectable()
export class DashboardAuthGuard implements CanActivate {
  constructor(private readonly dashboardAuthService: DashboardAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: DashboardUserReqObject }>();

    let authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (Array.isArray(authHeader)) {
      authHeader = authHeader[0];
    }

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    const payload = this.dashboardAuthService.verifyToken(token);

    if (payload.type !== 'dashboard') {
      throw new UnauthorizedException('Access denied: Dashboard access required');
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
    };

    return true;
  }
}
