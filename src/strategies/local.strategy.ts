import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

/**
 * Abstract Passport local strategy (email + password).
 *
 * Extend this class and implement `validate`. The concrete class must be
 * decorated with `@Injectable()` and provided in your module.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class LocalStrategy extends LocalAuthStrategy {
 *   constructor(private authService: AuthService) { super(); }
 *
 *   async validate(email: string, password: string) {
 *     return this.authService.validateUser(email, password);
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class LocalAuthStrategy extends PassportStrategy(Strategy, 'local') {
  constructor() {
    super({ usernameField: 'email' });
  }

  abstract validate(email: string, password: string): Promise<unknown>;
}
