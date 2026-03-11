import { Injectable } from '@nestjs/common';
import { ModuleRbacPolicy } from './rbac-policy';

/**
 * Central registry for all RBAC policies registered across feature modules.
 *
 * You should **not** inject this service directly in your application code.
 * Instead, use `SessionAuthModule.forFeature()` to register policies and let
 * the guards consume them automatically.
 */
@Injectable()
export class RbacRegistryService {
  private readonly policies = new Map<string, ModuleRbacPolicy>();

  /** Register a new policy (called internally by forFeature providers). */
  register(policy: ModuleRbacPolicy): void {
    this.policies.set(policy.module, policy);
  }

  /** Return all currently registered policies. */
  getPolicies(): ModuleRbacPolicy[] {
    return Array.from(this.policies.values());
  }
}
