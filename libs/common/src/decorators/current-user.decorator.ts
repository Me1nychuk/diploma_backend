import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTPayload } from 'src/auth/interfaces';

export const CurrentUser = createParamDecorator(
  (
    key: keyof JWTPayload,
    ctx: ExecutionContext,
  ): JWTPayload | Partial<JWTPayload> => {
    const req = ctx.switchToHttp().getRequest();
    return key ? req.user[key] : req.user;
  },
);
