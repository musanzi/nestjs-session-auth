// ─────────────────────────────────────────────────────────────────────────────
// RBAC Policy types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The four CRUD actions plus a wildcard "manage" that grants all.
 */
export type RbacAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

/**
 * Whether the grant applies to any resource or only resources owned by the user.
 */
export type RbacPossession = 'own' | 'any';

/**
 * A single requirement placed on a route handler via @Rbac().
 */
export interface RoleRequirement {
  /** The resource name (e.g. "articles", "users"). */
  resource: string;
  /** The action being performed. */
  action: RbacAction;
  /** Defaults to "any". */
  possession?: RbacPossession;
}

/**
 * A single permission grant inside a ModuleRbacPolicy.
 */
export interface RbacGrant {
  /** Roles this grant applies to. */
  roles: string[];
  /** Multiple actions. Takes precedence over `action`. */
  actions?: RbacAction[];
  /** Single action shorthand. */
  action?: RbacAction;
  /** Resources this grant covers. Use "*" to mean all resources. */
  resources: string[];
  /** Defaults to "any". */
  possession?: RbacPossession;
}

/**
 * A named set of grants belonging to one feature module.
 *
 * @example
 * ```ts
 * export const POSTS_RBAC: ModuleRbacPolicy = {
 *   module: 'posts',
 *   grants: [
 *     { roles: ['admin', 'editor'], actions: ['create', 'update', 'delete'], resources: ['posts'] },
 *     { roles: ['user'],             action:  'read',                         resources: ['posts'] },
 *   ],
 * };
 * ```
 */
export interface ModuleRbacPolicy {
  module: string;
  grants: RbacGrant[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal runtime representation
// ─────────────────────────────────────────────────────────────────────────────

type PermissionSet = { any: Set<string>; own: Set<string> };
type RolePolicy = Record<RbacAction, PermissionSet>;

const createEmptyPolicy = (): RolePolicy => ({
  create: { any: new Set(), own: new Set() },
  read: { any: new Set(), own: new Set() },
  update: { any: new Set(), own: new Set() },
  delete: { any: new Set(), own: new Set() },
  manage: { any: new Set(), own: new Set() },
});

const buildRolePolicyMap = (
  modulePolicies: ModuleRbacPolicy[],
): Map<string, RolePolicy> => {
  const map = new Map<string, RolePolicy>();

  for (const modulePolicy of modulePolicies) {
    for (const grant of modulePolicy.grants) {
      const possession: RbacPossession = grant.possession ?? 'any';
      const actions = grant.actions?.length
        ? grant.actions
        : grant.action
        ? [grant.action]
        : [];
      if (!actions.length) continue;

      for (const role of grant.roles) {
        if (!map.has(role)) map.set(role, createEmptyPolicy());
        const rolePolicy = map.get(role)!;
        for (const action of actions) {
          for (const resource of grant.resources) {
            rolePolicy[action][possession].add(resource);
          }
        }
      }
    }
  }
  return map;
};

const hasPermission = (
  policy: RolePolicy,
  requirement: RoleRequirement,
): boolean => {
  const possession = requirement.possession ?? 'any';
  const { resource, action } = requirement;
  const manage = policy.manage;
  const grants = policy[action];

  // "manage *" = superuser
  if (manage.any.has('*')) return true;
  // "manage <resource>"
  if (manage.any.has(resource)) return true;
  // exact action on any
  if (grants.any.has(resource)) return true;
  // exact action on own
  if (possession === 'own' && grants.own.has(resource)) return true;
  return false;
};

/**
 * Pure function: returns true if at least one of the user's roles satisfies
 * **every** requirement.
 */
export const canAccessAllRequirements = (
  userRoles: string[],
  requirements: RoleRequirement[],
  modulePolicies: ModuleRbacPolicy[],
): boolean => {
  if (!requirements.length) return true;
  if (!userRoles.length) return false;

  const rolePolicies = buildRolePolicyMap(modulePolicies);

  return requirements.every((requirement) => {
    for (const role of userRoles) {
      const policy = rolePolicies.get(role);
      if (policy && hasPermission(policy, requirement)) return true;
    }
    return false;
  });
};
