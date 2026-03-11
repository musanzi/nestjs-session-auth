import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_REQUIREMENTS_KEY } from '../decorators/rbac.decorator';
import { RbacRegistryService } from '../rbac/rbac-registry.service';
import { RoleRequirement, canAccessAllRequirements } from '../rbac/rbac-policy';

/**
 * Global guard that enforces RBAC policies defined via `@Rbac()`.
 *
 * Routes without any `@Rbac()` decorator are allowed through (auth is the
 * responsibility of `SessionAuthGuard`).
 *
 * Register it globally **after** `SessionAuthGuard`:
 * ```ts
 * providers: [
 *   { provide: APP_GUARD, useClass: SessionAuthGuard },
 *   { provide: APP_GUARD, useClass: RbacGuard },
 * ]
 * ```
 */
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly registry: RbacRegistryService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requirements = this.reflector.getAllAndOverride<RoleRequirement[]>(
      ROLE_REQUIREMENTS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // No RBAC annotation → allow (auth guard already ran)
    if (!requirements?.length) return true;

    const req = ctx.switchToHttp().getRequest();
    const userRoles: string[] = this.extractRoles(req.user as unknown);

    const allowed = canAccessAllRequirements(
      userRoles,
      requirements,
      this.registry.getPolicies(),
    );

    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }

  private extractRoles(user: unknown): string[] {
    if (!user || !Array.isArray((user as Record<string, unknown>)['roles'])) return [];
    const roles = (user as Record<string, unknown>)['roles'] as unknown[];
    return roles
      .map((r) => (typeof r === 'string' ? r : (r as { name?: string })?.name))
      .filter((r): r is string => typeof r === 'string');
  }
}
