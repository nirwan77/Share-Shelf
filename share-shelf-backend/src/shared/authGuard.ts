// src/guards/jwt-header-auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { DashboardUserReqObject } from './authDecorator';

@Injectable()
export class JwtHeaderAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: DashboardUserReqObject }>();

    // Check both lowercase and capitalized versions
    let authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    // Handle if authHeader is an array (shouldn't happen, but TypeScript thinks it can)
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

    const payload = this.authService.verifyToken(token);

    request.user = {
      id: payload.sub,
      email: payload.email,
    };

    return true;
  }
}
