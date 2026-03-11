import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/**
 * Default PassportJS session serializer.
 *
 * Stores the **entire user object** in the session. This is fine for most
 * apps but if you want to store only an ID and reload from the DB on each
 * request, extend `PassportSerializer` yourself and provide it in your module.
 *
 * @example (override with ID-only serialization)
 * ```ts
 * @Injectable()
 * export class MySerializer extends PassportSerializer {
 *   serializeUser(user: User, done) { done(null, user.id); }
 *   async deserializeUser(id: string, done) {
 *     const user = await this.usersService.findOne(id);
 *     done(null, user);
 *   }
 * }
 * ```
 */
@Injectable()
export class DefaultSessionSerializer extends PassportSerializer {
  serializeUser(user: unknown, done: (err: Error | null, user: unknown) => void): void {
    done(null, user);
  }

  deserializeUser(payload: unknown, done: (err: Error | null, payload: unknown) => void): void {
    done(null, payload);
  }
}
