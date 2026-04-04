import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { DashboardUserReqObject } from './authDecorator';

@Injectable()
export class JwtOptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

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
      return true; // No header, proceed as guest
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return true; // Invalid format, proceed as guest
    }

    try {
      const payload = this.authService.verifyToken(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
      };
    } catch (e) {
      // Token invalid or expired, proceed as guest
    }

    return true;
  }
}
