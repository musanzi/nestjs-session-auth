import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator that injects the currently authenticated user (or a
 * specific property of it) from the Express request.
 *
 * @example
 * ```ts
 * // Inject the full user object
 * @Get('me')
 * getMe(@CurrentUser() user: User) { ... }
 *
 * // Inject a single property
 * @Get('me/id')
 * getId(@CurrentUser('id') id: string) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return key ? user?.[key] : user;
  },
);
