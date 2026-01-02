import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface DashboardUserReqObject {
  id: string;
  email: string;
}

export const GetDashboardUserReqObject = createParamDecorator(
  (data: keyof DashboardUserReqObject | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<
      Request & {
        user?: DashboardUserReqObject;
      }
    >();

    return data ? request.user?.[data] : request.user;
  },
);
