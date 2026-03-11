import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that authenticates a request against the local (email + password)
 * Passport strategy and then establishes a session.
 *
 * Use on your sign-in endpoint:
 * ```ts
 * @Post('signin')
 * @Public()
 * @UseGuards(LocalAuthGuard)
 * signIn(@Req() req: Request) { return req.user; }
 * ```
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(ctx)) as boolean;
    await super.logIn(ctx.switchToHttp().getRequest());
    return result;
  }
}
