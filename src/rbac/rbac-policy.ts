/**
 * The four CRUD actions plus a wildcard "manage" that grants all.
 */
export type RbacAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

/**
 * A single requirement placed on a route handler via @Rbac().
 */
export interface RoleRequirement {
  /** The resource name (e.g. "articles", "users"). */
  resource: string;
  /** The action being performed. */
  action: RbacAction;
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
 *     { roles: ['user'],            action:  'read',                         resources: ['posts'] },
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

type RolePolicy = Record<RbacAction, Set<string>>;

const createEmptyPolicy = (): RolePolicy => ({
  create: new Set(),
  read: new Set(),
  update: new Set(),
  delete: new Set(),
  manage: new Set(),
});

const buildRolePolicyMap = (modulePolicies: ModuleRbacPolicy[]): Map<string, RolePolicy> => {
  const map = new Map<string, RolePolicy>();

  for (const modulePolicy of modulePolicies) {
    for (const grant of modulePolicy.grants) {
      const actions = grant.actions?.length ? grant.actions : grant.action ? [grant.action] : [];
      if (!actions.length) continue;

      for (const role of grant.roles) {
        if (!map.has(role)) map.set(role, createEmptyPolicy());
        const rolePolicy = map.get(role)!;
        for (const action of actions) {
          for (const resource of grant.resources) {
            rolePolicy[action].add(resource);
          }
        }
      }
    }
  }
  return map;
};

const hasPermission = (policy: RolePolicy, requirement: RoleRequirement): boolean => {
  const { resource, action } = requirement;
  // "manage *" = superuser
  if (policy.manage.has('*')) return true;
  // "manage <resource>"
  if (policy.manage.has(resource)) return true;
  // exact action on resource
  if (policy[action].has(resource)) return true;
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
