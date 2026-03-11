import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

export interface GoogleStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  /** Extra scopes beyond email + profile. */
  scope?: string[];
}

/**
 * Abstract Passport Google OAuth2 strategy.
 *
 * Extend and implement `validate` to map a Google profile to your user entity.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class GoogleStrategy extends GoogleAuthStrategy {
 *   constructor(private authService: AuthService, config: ConfigService) {
 *     super({
 *       clientID:     config.get('GOOGLE_CLIENT_ID'),
 *       clientSecret: config.get('GOOGLE_SECRET'),
 *       callbackURL:  config.get('GOOGLE_REDIRECT_URI'),
 *     });
 *   }
 *
 *   async validate(_at: string, _rt: string, profile: Profile, done: VerifyCallback) {
 *     const user = await this.authService.findOrCreate(profile);
 *     done(null, user);
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(options: GoogleStrategyOptions) {
    super({
      clientID: options.clientID,
      clientSecret: options.clientSecret,
      callbackURL: options.callbackURL,
      scope: ['email', 'profile', ...(options.scope ?? [])],
    });
  }

  abstract validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void>;
}

export { Profile as GoogleProfile, VerifyCallback as GoogleVerifyCallback };
