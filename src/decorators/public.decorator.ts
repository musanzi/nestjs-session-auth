import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'session_auth:isPublic';

/**
 * Marks a route as **publicly accessible** — the `SessionAuthGuard` will
 * skip the authentication check for decorated handlers.
 *
 * @example
 * ```ts
 * @Get('feed')
 * @Public()
 * getFeed() { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
