import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that initiates and handles the Google OAuth2 flow.
 *
 * Use on both the redirect-to-Google and the callback endpoints:
 * ```ts
 * @Get('google')        @Public() @UseGuards(GoogleAuthGuard) googleAuth() {}
 * @Get('google/cb')     @Public() @UseGuards(GoogleAuthGuard) googleCb(@Res() res) { res.redirect('/'); }
 * ```
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(ctx)) as boolean;
    await super.logIn(ctx.switchToHttp().getRequest());
    return result;
  }
}
