import { SetMetadata } from '@nestjs/common';
import { RoleRequirement } from '../rbac/rbac-policy';

export const ROLE_REQUIREMENTS_KEY = 'session_auth:roleRequirements';

/**
 * Attaches RBAC requirements to a route handler. The `RbacGuard` evaluates
 * these against the authenticated user's roles before allowing access.
 *
 * Multiple arguments are treated as AND — the user must satisfy **all** of them.
 *
 * @example
 * ```ts
 * @Post()
 * @Rbac({ resource: 'articles', action: 'create' })
 * create(@Body() dto: CreateArticleDto) { ... }
 *
 * @Delete(':id')
 * @Rbac({ resource: 'articles', action: 'delete' })
 * remove(@Param('id') id: string) { ... }
 * ```
 */
export const Rbac = (...requirements: RoleRequirement[]) =>
  SetMetadata(ROLE_REQUIREMENTS_KEY, requirements);
