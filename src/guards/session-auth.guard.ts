import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Global guard that protects every route by default using Passport session
 * authentication (`req.isAuthenticated()`).
 *
 * Routes decorated with `@Public()` bypass this guard entirely.
 *
 * Register it globally in your `AppModule`:
 * ```ts
 * providers: [{ provide: APP_GUARD, useClass: SessionAuthGuard }]
 * ```
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]) ?? false;

    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    if (!req.isAuthenticated()) {
      throw new UnauthorizedException('Authentication required');
    }
    return true;
  }
}
